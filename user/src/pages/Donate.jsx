import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initiateKhaltiDonation } from '../services/donationService'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Donate.css'



function Donate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  console.log('Donate page loaded, user:', user)

  const [formData, setFormData] = useState({
    donorName: user?.name || '',
    email: user?.email || '',
    amount: '',
    purpose: 'General donation',
    description: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      // Validate form data
      if (!formData.donorName.trim() || !formData.email.trim() || !formData.amount) {
        throw new Error('Please fill in all required fields')
      }

      if (parseFloat(formData.amount) < 10) {
        throw new Error('Minimum donation amount is NPR 10')
      }

      const response = await initiateKhaltiDonation({
        donorName: formData.donorName.trim(),
        email: formData.email.trim(),
        amount: parseFloat(formData.amount),
        purpose: formData.purpose || 'General donation',
        description: formData.description.trim()
      })

      // Redirect to Khalti payment page
      if (response.payment_url) {
        window.location.href = response.payment_url
      } else {
        throw new Error('Invalid payment URL received')
      }

    } catch (err) {
      console.error('Donation initiation error:', err)
      setError(err.message || 'Failed to initiate Khalti payment')
      setLoading(false)
    }
  }

  return (
    <div className="donate-page">
      <Navbar />

      <div className="donate-container">
        <div className="donate-card">
          <h2>Donate via Khalti</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
              placeholder="Donor Name"
              required
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Amount (NPR)"
              required
              min="10"
            />

            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Purpose"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description (optional)"
            />

            <button type="submit" className="donate-submit-button" disabled={loading}>
              {loading ? 'Redirecting to Khalti...' : 'Pay with Khalti'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Donate
