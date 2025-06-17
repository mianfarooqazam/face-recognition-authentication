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
    try {
      setStatus({ message: '📹 Initializing camera...', type: 'loading' })
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        setStatus({ message: '✨ Camera ready! Position your face in the center and click "Scan Face".', type: 'success' })
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setStatus({ message: '❌ Camera access denied. Please allow camera permissions and try again.', type: 'error' })
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