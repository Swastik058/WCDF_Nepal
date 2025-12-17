import axios from 'axios'
import { getToken } from './authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create donation
export const createDonation = async (donationData) => {
  try {
    const token = getToken()
    const response = await axios.post(
      `${API_URL}/donation`,
      donationData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Donation failed' }
  }
}

// Get user donations
export const getUserDonations = async () => {
  try {
    const token = getToken()
    const response = await axios.get(
      `${API_URL}/donation`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch donations' }
  }
}

// Initiate Khalti donation 
export const initiateKhaltiDonation = async (donationData) => {
  try {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // Add authorization header only if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await axios.post(
      `${API_URL}/khalti/initiate`,
      donationData,
      { headers }
    )

    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Khalti payment initiation failed' }
  }
}

// Verify Khalti payment
export const verifyKhaltiPayment = async (pidx) => {
  try {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // Add authorization header only if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await axios.post(
      `${API_URL}/khalti/verify`,
      { pidx },
      { headers }
    )

    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Payment verification failed' }
  }
}
