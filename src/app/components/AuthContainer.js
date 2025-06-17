'use client'

import { useState, useRef, useEffect } from 'react'
import CameraView from './CameraView'
import RegistrationForm from './RegistrationForm'
import StatusDisplay from './StatusDisplay'
import { detectFaceInVideo, captureFaceDescriptor } from '../utils/faceApi'
import { findMatchingUser, saveUser } from '../utils/userStorage'

const AuthContainer = ({ onLogin, isModelsLoaded }) => {
  const [status, setStatus] = useState({ message: 'Loading face detection models...', type: 'loading' })
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [capturedDescriptor, setCapturedDescriptor] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (isModelsLoaded) {
      setStatus({ message: '🤖 AI models loaded successfully! Ready to scan your face.', type: 'success' })
    }
  }, [isModelsLoaded])

  const startCamera = async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setStatus({ 
        message: '❌ Camera access is not available in this environment.', 
        type: 'error' 
      })
      return
    }

    // Check browser compatibility
    const isSecureContext = window.isSecureContext
    if (!isSecureContext) {
      setStatus({
        message: '❌ Camera access requires a secure context (HTTPS). Please use HTTPS or localhost.',
        type: 'error'
      })
      return
    }

    // Check if we're on a supported browser
    const isSupportedBrowser = /Chrome|Firefox|Safari|Edge/i.test(navigator.userAgent)
    if (!isSupportedBrowser) {
      setStatus({
        message: '❌ Your browser is not supported. Please use Chrome, Firefox, Safari, or Edge.',
        type: 'error'
      })
      return
    }

    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    try {
      setStatus({ message: '📹 Initializing camera...', type: 'loading' })

      // Try to get available devices first
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        setStatus({
          message: '❌ No camera found. Please ensure you have a camera connected.',
          type: 'error'
        })
        return
      }

      const constraints = {
        video: {
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 },
          facingMode: 'user'
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        setStatus({ message: '✨ Camera ready! Position your face in the center and click "Scan Face".', type: 'success' })
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      let errorMessage = '❌ Camera access denied. Please allow camera permissions and try again.'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '❌ Camera access was denied. Please allow camera permissions in your browser settings.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = '❌ No camera found. Please ensure you have a camera connected.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = '❌ Camera is in use by another application. Please close other applications using the camera.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '❌ Camera constraints could not be satisfied. Please try again.'
      } else if (error.name === 'TypeError') {
        errorMessage = '❌ Camera access is not supported in this browser. Please try using Chrome, Firefox, or Safari.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = '❌ Your browser does not support camera access. Please try using Chrome, Firefox, or Safari.'
      } else if (error.name === 'AbortError') {
        errorMessage = '❌ Camera access was aborted. Please try again.'
      } else if (error.name === 'SecurityError') {
        errorMessage = '❌ Camera access requires a secure context (HTTPS). Please use HTTPS or localhost.'
      }
      
      setStatus({ message: errorMessage, type: 'error' })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  const captureFace = async () => {
    try {
      setStatus({ message: '🔍 Analyzing your face...', type: 'loading' })

      const result = await captureFaceDescriptor(videoRef.current)
      
      if (!result.success) {
        setStatus({ message: result.message, type: 'error' })
        return
      }

      const faceDescriptor = result.descriptor
      const existingUser = await findMatchingUser(faceDescriptor)

      if (existingUser) {
        existingUser.lastLogin = new Date().toISOString()
        setStatus({ message: `🎉 Welcome back, ${existingUser.username}!`, type: 'success' })
        setTimeout(() => {
          onLogin(existingUser)
          stopCamera()
        }, 2000)
      } else {
        setCapturedDescriptor(faceDescriptor)
        setShowRegistration(true)
        setStatus({ message: '👋 New face detected! Please complete your registration below.', type: 'success' })
      }
    } catch (error) {
      console.error('Error capturing face:', error)
      setStatus({ message: '❌ Face analysis failed. Please ensure good lighting and try again.', type: 'error' })
    }
  }

  const handleRegistration = (userData) => {
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      faceDescriptor: Array.from(capturedDescriptor),
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    saveUser(newUser)
    setStatus({ message: `🎊 Welcome aboard, ${newUser.username}! Your face has been registered.`, type: 'success' })
    
    setTimeout(() => {
      onLogin(newUser)
      stopCamera()
    }, 2000)
  }

  useEffect(() => {
    let animationFrame
    
    if (isCameraActive && videoRef.current && canvasRef.current) {
      const detectLoop = () => {
        detectFaceInVideo(videoRef.current, canvasRef.current)
        animationFrame = requestAnimationFrame(detectLoop)
      }
      detectLoop()
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isCameraActive])

  return (
    <div className="bg-white rounded-lg p-8 shadow-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Face Recognition Login</h1>
        <p className="text-gray-600">Secure authentication powered by AI</p>
      </div>

      {/* Camera Section */}
      <div className="mb-6">
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraActive={isCameraActive}
        />
      </div>

      {/* Status Display */}
      <div className="mb-6">
        <StatusDisplay status={status} />
      </div>

      {/* Control Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={startCamera}
          disabled={!isModelsLoaded || isCameraActive}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {!isModelsLoaded ? 'Loading AI Models...' : 'Activate Camera'}
        </button>

        <button
          onClick={captureFace}
          disabled={!isCameraActive}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Scan My Face
        </button>
      </div>

      {/* Registration Form */}
      {showRegistration && (
        <RegistrationForm onSubmit={handleRegistration} />
      )}
    </div>
  )
}

export default AuthContainer