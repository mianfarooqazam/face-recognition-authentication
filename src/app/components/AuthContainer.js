'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Paper, Typography, Button, Stack, Fade, Box, Backdrop, CircularProgress } from '@mui/material'
import { Camera, Scan, Shield, Loader2 } from 'lucide-react'
import CameraView from '@/app/components/CameraView'
import StatusDisplay from '@/app/components/StatusDisplay'
import { detectFaceInVideo, captureFaceDescriptor } from '@/app/utils/faceApi'
import { findMatchingUser } from '@/app/utils/userStorage'

const AuthContainer = ({ onLogin, isModelsLoaded }) => {
  const router = useRouter()
  const [status, setStatus] = useState({ message: 'Loading face detection models...', type: 'loading' })
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [redirectMessage, setRedirectMessage] = useState('Redirecting...')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (isModelsLoaded) {
      setStatus({ message: '🤖 AI models loaded successfully! Ready to scan your face.', type: 'success' })
      setIsLoaded(true)
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

  const captureFaceImage = () => {
    // Create a canvas to capture the current video frame
    const canvas = document.createElement('canvas')
    const video = videoRef.current
    
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw the current video frame to canvas
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to base64 image data
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const captureFace = async () => {
    try {
      setStatus({ message: '🔍 Analyzing your face...', type: 'loading' })

      const result = await captureFaceDescriptor(videoRef.current)
      
      if (!result.success) {
        setStatus({ message: result.message, type: 'error' })
        return
      }

      // Capture the current video frame as an image
      const capturedImage = captureFaceImage()
      if (capturedImage && typeof window !== 'undefined') {
        sessionStorage.setItem('capturedFaceImage', capturedImage)
      }

      const faceDescriptor = result.descriptor
      const existingUser = await findMatchingUser(faceDescriptor)

      if (existingUser) {
        existingUser.lastLogin = new Date().toISOString()
        setStatus({ message: `🎉 Welcome back, ${existingUser.username}!`, type: 'success' })
        setRedirectMessage('Redirecting to Dashboard...')
        
        // Stop camera before logging in
        stopCamera()
        
        // Show loader and redirect to dashboard
        setTimeout(() => {
          setIsRedirecting(true)
          setTimeout(() => {
            onLogin(existingUser)
          }, 1000)
        }, 2000)
      } else {
        // Store face descriptor temporarily
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingFaceDescriptor', JSON.stringify(Array.from(faceDescriptor)))
        }
        
        setStatus({ message: '👋 New face detected! Redirecting to registration...', type: 'success' })
        setRedirectMessage('Redirecting to Registration...')
        
        // Stop camera and redirect to registration
        setTimeout(() => {
          stopCamera()
          setIsRedirecting(true)
          setTimeout(() => {
            router.push('/registration')
          }, 1000)
        }, 1500)
      }
    } catch (error) {
      console.error('Error capturing face:', error)
      setStatus({ message: '❌ Face analysis failed. Please ensure good lighting and try again.', type: 'error' })
    }
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

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
        open={isRedirecting}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}
        >
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ color: 'white' }}
          />
          <Typography 
            variant="h5" 
            fontWeight="medium"
            sx={{ textAlign: 'center' }}
          >
            {redirectMessage}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ opacity: 0.8, textAlign: 'center' }}
          >
            Please wait while we prepare your account
          </Typography>
        </Box>
      </Backdrop>

      <Fade in={isLoaded} timeout={600}>
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              width: '100%'
            }}
          >
            {/* Header */}
            <Box 
              sx={{ 
                textAlign: 'center',
                color: 'white',
                mb: 2
              }}
            >
              <Box 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '50%',
                  p: 3,
                  mb: 3,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Shield size={30} color="white" />
              </Box>
              
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                }}
              >
                Face Recognition Login
              </Typography>
              
              <Typography 
                variant="h6"
                sx={{ opacity: 0.6 }}
              >
                Secure authentication powered by AI
              </Typography>
            </Box>

            {/* Main Content Paper */}
            <Paper 
              elevation={24} 
              sx={{ 
                width: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Box sx={{ p: 4 }}>
                {/* Camera Section */}
                <Box sx={{ mb: 3 }}>
                  <CameraView
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    isCameraActive={isCameraActive}
                  />
                </Box>

                {/* Status Display */}
                <Box sx={{ mb: 3 }}>
                  <StatusDisplay status={status} />
                </Box>

                {/* Control Buttons */}
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={startCamera}
                    disabled={!isModelsLoaded || isCameraActive}
                    startIcon={!isModelsLoaded ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'medium',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    {!isModelsLoaded ? 'Loading AI Models...' : 'Activate Camera'}
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={captureFace}
                    disabled={!isCameraActive}
                    startIcon={<Scan size={20} />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'medium',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.6)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    Scan My Face
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Fade>
    </>
  )
}

export default AuthContainer