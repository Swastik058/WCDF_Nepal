import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { initiateKhaltiDonation } from '../services/donationService'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Donate.css'

const DONATION_PURPOSES = [
  { value: 'General donation', label: 'General Support' },
  { value: 'Child education', label: 'Child Education' },
  { value: 'Healthcare', label: 'Healthcare Support' },
  { value: 'Food and nutrition', label: 'Food & Nutrition' },
  { value: 'Building project', label: 'Building Project' },
  { value: 'Emergency relief', label: 'Emergency Relief' },
  { value: 'Other', label: 'Other' }
]

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000]

function Donate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
    
    // Check for payment failure from redirect
    const paymentStatus = searchParams.get('payment')
    const reason = searchParams.get('reason')
    const errorType = searchParams.get('error')
    
    if (paymentStatus === 'failed') {
      let errorMessage = 'Payment failed. Please try again.'
      
      if (reason) {
        errorMessage = `Payment failed: ${reason}`
      } else if (errorType === 'verification_failed') {
        errorMessage = 'Payment verification failed due to network issues. Please try again.'
      } else if (errorType === 'missing_pidx') {
        errorMessage = 'Payment verification failed: Missing payment ID. Please try again.'
      } else if (errorType === 'donation_not_found') {
        errorMessage = 'Payment verification failed: Donation record not found. Please contact support.'
      }
      
      setError(errorMessage)
      // Clean up URL parameters
      setSearchParams({})
    }
  }, [user, navigate, searchParams, setSearchParams])

  const [formData, setFormData] = useState({
    donorName: user?.name || '',
    email: user?.email || '',
    amount: '',
    purpose: 'General donation',
    description: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    
    // Clear quick amount selection if user types custom amount
    if (e.target.name === 'amount') {
      setSelectedQuickAmount(null)
    }
  }

  const handleQuickAmount = (amount) => {
    setFormData({
      ...formData,
      amount: amount.toString()
    })
    setSelectedQuickAmount(amount)
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

      <div className="donate-hero">
        <div className="donate-hero-content">
          <h1>Make a Difference Today</h1>
          <p>Your donation helps us provide better care and support to children and women in need across Nepal.</p>
        </div>
      </div>

      <div className="donate-container">
        <div className="donate-main">
          <div className="donate-card">
            <div className="donate-header">
              <h2>Donate Now</h2>
              <p>Every contribution makes a meaningful impact in someone's life</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="donate-form">
              {/* Personal Information */}
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="donorName">Full Name *</label>
                    <input
                      type="text"
                      id="donorName"
                      name="donorName"
                      value={formData.donorName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Donation Amount */}
              <div className="form-section">
                <h3>Donation Amount</h3>
                <div className="quick-amounts">
                  {QUICK_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className={`quick-amount-btn ${selectedQuickAmount === amount ? 'selected' : ''}`}
                      onClick={() => handleQuickAmount(amount)}
                    >
                      NPR {amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="form-group">
                  <label htmlFor="amount">Custom Amount (NPR) *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter custom amount"
                    required
                    min="10"
                  />
                  <small>Minimum donation: NPR 10</small>
                </div>
              </div>

              {/* Donation Purpose */}
              <div className="form-section">
                <h3>Donation Purpose</h3>
                <div className="form-group">
                  <label htmlFor="purpose">How would you like your donation to be used?</label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                  >
                    {DONATION_PURPOSES.map((purpose) => (
                      <option key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Additional Message (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Share why you're donating or any special message..."
                    rows="3"
                  />
                </div>
              </div>

              <button type="submit" className="donate-submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Redirecting to Khalti...
                  </>
                ) : (
                  <>
                    <span className="khalti-logo">K</span>
                    Pay with Khalti
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Impact Information */}
          <div className="impact-card">
            <h3>Your Impact</h3>
            <div className="impact-items">
              <div className="impact-item">
                <div className="impact-icon">Food</div>
                <div className="impact-text">
                  <strong>NPR 500</strong>
                  <span>Provides meals for a child for a week</span>
                </div>
              </div>
              <div className="impact-item">
                <div className="impact-icon">Education</div>
                <div className="impact-text">
                  <strong>NPR 1,000</strong>
                  <span>Covers school supplies for a month</span>
                </div>
              </div>
              <div className="impact-item">
                <div className="impact-icon">Health</div>
                <div className="impact-text">
                  <strong>NPR 2,000</strong>
                  <span>Supports healthcare for a family</span>
                </div>
              </div>
              <div className="impact-item">
                <div className="impact-icon">Shelter</div>
                <div className="impact-text">
                  <strong>NPR 5,000</strong>
                  <span>Contributes to shelter improvements</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Donate
