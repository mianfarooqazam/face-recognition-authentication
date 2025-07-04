'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthContainer from '@/app/components/AuthContainer'
import Dashboard from '@/app/components/Dashboard'
import { loadFaceApiModels } from '@/app/utils/faceApi'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    loadFaceApiModels()
      .then(() => {
        setIsModelsLoaded(true)
      })
      .catch((error) => {
        console.error('Error loading face-api models:', error)
      })
  }, [])

  useEffect(() => {
    // Check if coming back from successful registration
    if (searchParams.get('registration') === 'success') {
      const registeredUser = sessionStorage.getItem('registeredUser')
      if (registeredUser) {
        const user = JSON.parse(registeredUser)
        sessionStorage.removeItem('registeredUser')
        
        // Auto-login after registration
        setTimeout(() => {
          handleLogin(user)
        }, 1000)
      }
    }
  }, [searchParams])

  const handleLogin = (user) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
  }

  return (
    <>
      {searchParams.get('registration') === 'success' && !isLoggedIn && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-center">
          🎊 Registration successful! Logging you in...
        </div>
      )}
      
      {!isLoggedIn ? (
        <AuthContainer 
          onLogin={handleLogin} 
          isModelsLoaded={isModelsLoaded}
        />
      ) : (
        <Dashboard 
          user={currentUser} 
          onLogout={handleLogout} 
        />
      )}
    </>
  )
}