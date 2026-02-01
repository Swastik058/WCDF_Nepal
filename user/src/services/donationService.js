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
    
    if (!token) {
      throw new Error('Authentication required. Please log in to make a donation.')
    }

    const response = await axios.post(
      `${API_URL}/khalti/initiate`,
      donationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Khalti payment initiation failed' }
  }
}

// Note: verifyKhaltiPayment is no longer needed on frontend
// Verification is handled entirely by backend redirect flow
