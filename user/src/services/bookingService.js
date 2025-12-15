import axios from 'axios'
import { getToken } from './authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create booking
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(
      `${API_URL}/booking`,
      bookingData
    )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Booking failed' }
  }
}

// Get user bookings
export const getUserBookings = async () => {
  try {
    const token = getToken()
    const response = await axios.get(
      `${API_URL}/booking`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch bookings' }
  }
}

