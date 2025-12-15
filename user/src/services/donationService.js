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

