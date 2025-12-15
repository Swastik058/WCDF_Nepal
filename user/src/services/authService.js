import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Register user
export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' }
  }
}

// Login user
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' }
  }
}

// Logout user
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token')
}

