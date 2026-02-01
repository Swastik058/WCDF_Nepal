import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import './KhaltiVerify.css'

function KhaltiVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Processing payment verification...')
  const [donationDetails, setDonationDetails] = useState(null)

  useEffect(() => {
    // Get parameters from URL (set by backend redirect)
    const urlStatus = searchParams.get('status')
    const pidx = searchParams.get('pidx')
    const donationId = searchParams.get('donation_id')
    const amount = searchParams.get('amount')
    const error = searchParams.get('error')
    const khaltiStatus = searchParams.get('khalti_status')

    console.log('KhaltiVerify received params:', { urlStatus, pidx, donationId, amount, error, khaltiStatus })

    if (urlStatus === 'success') {
      setStatus('success')
      setMessage('Payment completed successfully!')
      
      if (donationId && amount) {
        setDonationDetails({
          id: donationId,
          amount: amount,
          pidx: pidx
        })
      }

      // Auto-redirect to dashboard after showing success
      if (user) {
        localStorage.setItem('fromPaymentVerification', 'true')
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      }
    } else if (urlStatus === 'failed') {
      setStatus('failed')
      
      if (error === 'missing_pidx') {
        setMessage('Payment verification failed: Missing payment ID')
      } else if (error === 'donation_not_found') {
        setMessage('Payment verification failed: Donation record not found')
      } else if (error === 'verification_failed') {
        setMessage('Payment verification failed: Unable to verify with Khalti')
      } else if (khaltiStatus) {
        setMessage(`Payment not completed. Status: ${khaltiStatus}`)
      } else {
        setMessage('Payment verification failed')
      }
    } else {
      // No status parameter - shouldn't happen with proper flow
      setStatus('failed')
      setMessage('Invalid verification request')
    }
  }, [searchParams, user, navigate])

  const handleContinue = () => {
    if (user && status === 'success') {
      localStorage.setItem('fromPaymentVerification', 'true')
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="khalti-verify-page">
      <Navbar />
      
      <div className="verify-container">
        <div className="verify-card">
          {status === 'loading' && (
            <div className="verify-loading">
              <Loader />
              <h2>Processing Payment</h2>
              <p>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="verify-success">
              <div className="success-icon">Success</div>
              <h2>Payment Successful!</h2>
              <p>{message}</p>
              
              {donationDetails && (
                <div className="donation-details">
                  <h3>Donation Details</h3>
                  <div className="detail-item">
                    <span>Amount:</span>
                    <span>NPR {donationDetails.amount}</span>
                  </div>
                  <div className="detail-item">
                    <span>Payment ID:</span>
                    <span>{donationDetails.pidx}</span>
                  </div>
                </div>
              )}

              <div className="redirect-notice">
                <p>Redirecting to dashboard in a few seconds...</p>
              </div>

              <button onClick={handleContinue} className="continue-button">
                {user ? 'Go to Dashboard Now' : 'Continue to Home'}
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="verify-failed">
              <div className="error-icon">Failed</div>
              <h2>Payment Verification Failed</h2>
              <p>{message}</p>
              
              <div className="failed-actions">
                <button onClick={() => navigate('/')} className="continue-button">
                  Back to Home
                </button>
                <button onClick={() => navigate('/donate')} className="retry-button">
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default KhaltiVerify