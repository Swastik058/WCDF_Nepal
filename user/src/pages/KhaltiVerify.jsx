import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyKhaltiPayment } from '../services/donationService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import './KhaltiVerify.css'

function KhaltiVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, failed
  const [message, setMessage] = useState('Verifying your payment...')
  const [donation, setDonation] = useState(null)

  useEffect(() => {
    const pidx = searchParams.get('pidx')
    const txnId = searchParams.get('txnId')
    const amount = searchParams.get('amount')
    const mobile = searchParams.get('mobile')

    if (!pidx) {
      setStatus('failed')
      setMessage('Invalid payment verification link')
      return
    }

    verifyPayment(pidx)
  }, [searchParams])

  const verifyPayment = async (pidx) => {
    try {
      const response = await verifyKhaltiPayment(pidx)
      
      if (response.success) {
        setStatus('success')
        setMessage('Payment verified successfully!')
        setDonation(response.donation)
      } else {
        setStatus('failed')
        setMessage(response.message || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setStatus('failed')
      setMessage(error.message || 'Failed to verify payment')
    }
  }

  const handleContinue = () => {
    navigate('/')
  }

  return (
    <div className="khalti-verify-page">
      <Navbar />
      
      <div className="verify-container">
        <div className="verify-card">
          {status === 'verifying' && (
            <div className="verify-loading">
              <Loader />
              <h2>Verifying Payment</h2>
              <p>Please wait while we verify your payment with Khalti...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="verify-success">
              <div className="success-icon">✅</div>
              <h2>Payment Successful!</h2>
              <p>{message}</p>
              
              {donation && (
                <div className="donation-details">
                  <h3>Donation Details</h3>
                  <div className="detail-item">
                    <span>Donor:</span>
                    <span>{donation.donorName}</span>
                  </div>
                  <div className="detail-item">
                    <span>Amount:</span>
                    <span>NPR {donation.amount}</span>
                  </div>
                  <div className="detail-item">
                    <span>Transaction ID:</span>
                    <span>{donation.transactionId}</span>
                  </div>
                  <div className="detail-item">
                    <span>Date:</span>
                    <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <button onClick={handleContinue} className="continue-button">
                Continue to Home
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="verify-failed">
              <div className="error-icon">❌</div>
              <h2>Payment Verification Failed</h2>
              <p>{message}</p>
              
              <div className="failed-actions">
                <button onClick={handleContinue} className="continue-button">
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