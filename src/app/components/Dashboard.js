import { useRef, useEffect, useState } from 'react'
import { Container, Paper, Typography, Button, Box, Stack, Chip, Grid, Divider, Fade, Avatar } from '@mui/material'
import { LogOut, Mail, Calendar, Clock, Shield, Activity, Settings, BarChart } from 'lucide-react'
import { updateUser } from '../utils/userStorage'

const Dashboard = ({ user, onLogout }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [userStats] = useState({
    totalLogins: Math.floor(Math.random() * 50) + 1,
    memberSince: user.registrationDate,
    lastActive: user.lastLogin
  })

  useEffect(() => {
    setIsLoaded(true)
    
    // Get the captured face image from sessionStorage
    const capturedImage = sessionStorage.getItem('capturedFaceImage')
    if (capturedImage) {
      setProfileImage(capturedImage)
      // Clear it from session storage after using it
      sessionStorage.removeItem('capturedFaceImage')
    }
    
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    }
    updateUser(updatedUser)
  }, [user])

  const handleLogout = () => {
    setTimeout(() => {
      onLogout()
    }, 300)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Fallback avatar generator
  const generateFallbackAvatar = () => {
    const initials = user.username.length >= 2 
      ? user.username.slice(0, 2).toUpperCase()
      : user.username.charAt(0).toUpperCase()
    
    return (
      <Avatar
        sx={{
          width: 150,
          height: 150,
          fontSize: '3rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        {initials}
      </Avatar>
    )
  }

  return (
    <Fade in={isLoaded} timeout={600}>
      <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 2 }}>
        <Box sx={{ width: '100%' }}>
          {/* Header */}
          <Box 
            sx={{ 
              textAlign: 'center',
              color: 'white',
              mb: 4
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              sx={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              Welcome {user.username}!
            </Typography>
            <Typography 
              variant="h6"
              sx={{ opacity: 0.9 }}
            >
              Successfully authenticated with face recognition
            </Typography>
          </Box>

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
              {/* User Profile Section */}
              <Box sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                  {/* Profile Image/Avatar */}
                  <Box sx={{ position: 'relative' }}>
                    {profileImage ? (
                      <Box
                        component="img"
                        src={profileImage}
                        alt="Profile"
                        sx={{
                          width: 150,
                          height: 150,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          border: '3px solid rgba(255, 255, 255, 0.8)'
                        }}
                      />
                    ) : (
                      generateFallbackAvatar()
                    )}
                    
                    <Chip
                      icon={<Shield size={16} />}
                      label="Verified"
                      color="success"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#10b981',
                        color: 'white'
                      }}
                    />
                  </Box>

                  {/* User Info */}
                  <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {user.username}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                      <Mail size={18} />
                      <Typography variant="body1" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Stats Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}
                  >
                    <Activity size={32} color="#667eea" />
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      {userStats.totalLogins}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Logins
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <Shield size={32} color="#10b981" />
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      ✓
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Face Verified
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    <BarChart size={32} color="#8b5cf6" />
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Protected
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Account Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Account Details
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Clock size={20} color="#667eea" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDateTime(user.lastLogin)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Calendar size={20} color="#667eea" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(userStats.memberSince)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {/* Quick Actions */}
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Settings size={20} />}
                      sx={{
                        py: 1.5,
                        color: '#fff',
                      }}
                    >
                      Account Settings
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Activity size={20} />}
                      sx={{
                        py: 1.5,
                        color: '#fff',
                      }}
                    >
                      Security Logs
                    </Button>
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLogout}
                  startIcon={<LogOut size={20} />}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'medium',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.6)',
                    }
                  }}
                >
                  Sign Out
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Fade>
  )
}

export default Dashboard