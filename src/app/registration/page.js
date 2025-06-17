'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Container, Paper, Typography, Button, Stack, Fade } from '@mui/material'
import { ArrowLeft, UserCheck, Camera, Sparkles } from 'lucide-react'
import RegistrationForm from '../components/RegistrationForm'
import { saveUser } from '../utils/userStorage'

export default function RegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Get face descriptor from session storage
    const descriptorData = sessionStorage.getItem('pendingFaceDescriptor')
    if (!descriptorData) {
      // No face data, redirect back to home
      router.push('/')
      return
    }
    
    try {
      const descriptor = JSON.parse(descriptorData)
      setFaceDescriptor(descriptor)
      setIsLoaded(true)
    } catch (error) {
      console.error('Error parsing face descriptor:', error)
      router.push('/')
    }
  }, [router])

  const handleRegistration = (userData) => {
    if (!faceDescriptor) {
      console.error('No face descriptor available')
      return
    }

    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      faceDescriptor: Array.from(faceDescriptor),
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    saveUser(newUser)
    
    // Clear the temporary face data
    sessionStorage.removeItem('pendingFaceDescriptor')
    
    // Store user data for auto-login
    sessionStorage.setItem('registeredUser', JSON.stringify(newUser))
    
    // Redirect back to home with success message
    router.push('/?registration=success')
  }

  const handleCancel = () => {
    sessionStorage.removeItem('pendingFaceDescriptor')
    router.push('/')
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Fade in={isLoaded} timeout={600}>
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}
          >
            {/* Icon and Header */}
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
                <UserCheck size={40} color="white" />
              </Box>
              
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                }}
              >
                Almost There!
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 1,
                  opacity: 0.9
                }}
              >
                <Sparkles size={20} />
                <Typography variant="h6">
                  Your face has been captured successfully
                </Typography>
                <Camera size={20} />
              </Box>
            </Box>

            {/* Main Form Paper */}
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
                <RegistrationForm onSubmit={handleRegistration} />
              </Box>
            </Paper>

            {/* Cancel Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleCancel}
              startIcon={<ArrowLeft size={20} />}
              sx={{ 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255, 255, 255, 0.2)',
                },
                maxWidth: 'sm'
              }}
            >
              Back to Login
            </Button>
          </Box>
        </Container>
      </Fade>
    </Box>
  )
}