import { useState } from 'react'
import { 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Typography, 
  Alert,
  CircularProgress,
  Container,
  InputAdornment
} from '@mui/material'
import { User, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { checkUserExists } from '../utils/userStorage'

const RegistrationForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!newErrors.username && !newErrors.email) {
      const existingUser = checkUserExists(formData.username.trim(), formData.email.trim())
      if (existingUser) {
        if (existingUser.username.toLowerCase() === formData.username.toLowerCase()) {
          newErrors.username = 'Username already exists'
        }
        if (existingUser.email.toLowerCase() === formData.email.toLowerCase()) {
          newErrors.email = 'Email already exists'
        }
      }
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit({
        username: formData.username.trim(),
        email: formData.email.trim()
      })
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: 'Registration failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Just a few details to get you started
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Choose a Username"
            variant="outlined"
            margin="normal"
            value={formData.username}
            onChange={handleInputChange}
            error={!!errors.username}
            helperText={errors.username}
            disabled={isSubmitting}
            required
            placeholder="Enter your username"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={20} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            type="email"
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isSubmitting}
            required
            placeholder="Enter your email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={20} />
                </InputAdornment>
              ),
            }}
          />

          {errors.submit && (
            <Alert 
              severity="error" 
              sx={{ mt: 2 }}
              icon={<AlertCircle size={20} />}
            >
              {errors.submit}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'medium'
            }}
          >
            {isSubmitting ? 'Creating your account...' : 'Complete Registration'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default RegistrationForm