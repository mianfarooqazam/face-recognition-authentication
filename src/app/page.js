'use client'

import { useState, useEffect } from 'react'
import AuthContainer from '@/app/components/AuthContainer'
import Dashboard from '@/app/components/Dashboard'
import { loadFaceApiModels } from '@/app/utils/faceApi'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isModelsLoaded, setIsModelsLoaded] = useState(false)

  useEffect(() => {
    loadFaceApiModels()
      .then(() => {
        setIsModelsLoaded(true)
      })
      .catch((error) => {
        console.error('Error loading face-api models:', error)
      })
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
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
      </div>
    </div>
  )
}