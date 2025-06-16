import { useRef, useEffect, useState } from 'react'
import { updateUser } from '../utils/userStorage'

const Dashboard = ({ user, onLogout }) => {
  const avatarCanvasRef = useRef(null)
  const [userStats] = useState({
    totalLogins: Math.floor(Math.random() * 50) + 1,
    memberSince: user.registrationDate,
    lastActive: user.lastLogin
  })

  useEffect(() => {
    if (avatarCanvasRef.current) {
      const canvas = avatarCanvasRef.current
      const ctx = canvas.getContext('2d')
      
      const gradient = ctx.createLinearGradient(0, 0, 150, 150)
      gradient.addColorStop(0, '#3b82f6')
      gradient.addColorStop(0.5, '#8b5cf6')
      gradient.addColorStop(1, '#6366f1')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 150, 150)
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 40px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const initials = user.username.length >= 2 
        ? user.username.slice(0, 2).toUpperCase()
        : user.username.charAt(0).toUpperCase()
      
      ctx.fillText(initials, 75, 75)
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

  return (
    <div className="bg-white rounded-lg p-8 shadow-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        <p className="text-gray-600">Successfully authenticated with face recognition</p>
      </div>

      {/* User Profile */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
        <div className="flex flex-col items-center space-y-4">
          {/* User Avatar */}
          <canvas
            ref={avatarCanvasRef}
            width="100"
            height="100"
            className="rounded-full"
          />

          {/* User Details */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full text-sm">
            <div className="bg-white p-3 rounded-md border border-gray-200">
              <div className="text-gray-500">Last Login</div>
              <div className="font-medium text-gray-700">{formatDateTime(user.lastLogin)}</div>
            </div>
            
            <div className="bg-white p-3 rounded-md border border-gray-200">
              <div className="text-gray-500">Member Since</div>
              <div className="font-medium text-gray-700">{formatDate(userStats.memberSince)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-800">{userStats.totalLogins}</div>
          <div className="text-sm text-gray-600">Total Logins</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">✓</div>
          <div className="text-sm text-gray-600">Face Verified</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">AI</div>
          <div className="text-sm text-gray-600">Protected</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 text-left">
            <div className="font-medium text-gray-800">Account Settings</div>
            <div className="text-sm text-gray-500">Manage your profile</div>
          </button>

          <button className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 text-left">
            <div className="font-medium text-gray-800">Security Logs</div>
            <div className="text-sm text-gray-500">View login history</div>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Dashboard