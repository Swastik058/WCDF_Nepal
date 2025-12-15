import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDonation } from '../services/donationService'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Donate.css'

function Donate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    donorName: user?.name || '',
    email: user?.email || '',
    amount: '',
    paymentMethod: '',
    purpose: 'General donation',
    description: '',
    transactionId: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await createDonation(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/home')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Donation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="donate-page">
        <Navbar />
        <div className="success-message">
          <h2>Thank you for your donation!</h2>
          <p>Your contribution makes a difference.</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="donate-page">
      <Navbar />
      <div className="donate-container">
        <div className="donate-card">
          <h2>Make a Donation</h2>
          <p className="donate-subtitle">Your support helps us make a difference</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="donorName">Donor Name</label>
              <input
                type="text"
                id="donorName"
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                required
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (NPR)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="Enter donation amount"
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="">Select payment method</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Purpose</label>
              <input
                type="text"
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Purpose of donation"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Additional information"
              />
            </div>

            <button type="submit" className="donate-submit-button" disabled={loading}>
              {loading ? 'Processing...' : 'Submit Donation'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Donate

