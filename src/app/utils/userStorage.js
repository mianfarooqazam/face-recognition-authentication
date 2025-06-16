import * as faceapi from '@vladmandic/face-api'

const STORAGE_KEY = 'registeredUsers'

export const getRegisteredUsers = () => {
  if (typeof window === 'undefined') return []
  
  try {
    const users = localStorage.getItem(STORAGE_KEY)
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error('Error loading users from storage:', error)
    return []
  }
}

export const saveUser = (user) => {
  if (typeof window === 'undefined') return false
  
  try {
    const users = getRegisteredUsers()
    users.push(user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    return true
  } catch (error) {
    console.error('Error saving user to storage:', error)
    return false
  }
}

export const updateUser = (updatedUser) => {
  if (typeof window === 'undefined') return false
  
  try {
    const users = getRegisteredUsers()
    const userIndex = users.findIndex(user => user.id === updatedUser.id)
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
      return true
    }
    return false
  } catch (error) {
    console.error('Error updating user in storage:', error)
    return false
  }
}

export const findMatchingUser = (faceDescriptor) => {
  const users = getRegisteredUsers()
  const threshold = 0.6 // Adjust this value to make matching more/less strict

  for (const user of users) {
    try {
      // Convert stored array back to Float32Array for comparison
      const storedDescriptor = new Float32Array(user.faceDescriptor)
      const distance = faceapi.euclideanDistance(faceDescriptor, storedDescriptor)
      
      if (distance < threshold) {
        return user
      }
    } catch (error) {
      console.error('Error comparing face descriptors:', error)
    }
  }
  
  return null
}

export const checkUserExists = (username, email) => {
  const users = getRegisteredUsers()
  return users.find(user => 
    user.username.toLowerCase() === username.toLowerCase() || 
    user.email.toLowerCase() === email.toLowerCase()
  )
}