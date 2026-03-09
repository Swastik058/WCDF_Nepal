import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'

function KhaltiVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Processing payment verification...')
  const [donationDetails, setDonationDetails] = useState(null)

  useEffect(() => {
    const urlStatus = searchParams.get('status')
    const pidx = searchParams.get('pidx')
    const donationId = searchParams.get('donation_id')
    const amount = searchParams.get('amount')
    const error = searchParams.get('error')
    const khaltiStatus = searchParams.get('khalti_status')

    if (urlStatus === 'success') {
      setStatus('success')
      setMessage('Payment completed successfully!')

      if (donationId && amount) {
        setDonationDetails({ id: donationId, amount, pidx })
      }

      if (user) {
        localStorage.setItem('fromPaymentVerification', 'true')
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      }
    } else if (urlStatus === 'failed') {
      setStatus('failed')

      if (error === 'missing_pidx') setMessage('Payment verification failed: Missing payment ID')
      else if (error === 'donation_not_found') setMessage('Payment verification failed: Donation record not found')
      else if (error === 'verification_failed') setMessage('Payment verification failed: Unable to verify with Khalti')
      else if (khaltiStatus) setMessage(`Payment not completed. Status: ${khaltiStatus}`)
      else setMessage('Payment verification failed')
    } else {
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
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-3xl items-center justify-center px-6 py-12">
        <div className="w-full rounded-xl bg-white p-8 text-center shadow">
          {status === 'loading' && (
            <div className="space-y-3">
              <Loader />
              <h2 className="text-3xl font-bold text-teal-900">Processing Payment</h2>
              <p className="text-slate-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="mb-4 text-3xl font-bold uppercase tracking-wide text-emerald-600">Success</div>
              <h2 className="text-3xl font-bold text-emerald-600">Payment Successful!</h2>
              <p className="mt-3 text-slate-600">{message}</p>

              {donationDetails && (
                <div className="mx-auto mt-6 max-w-md rounded-lg bg-slate-50 p-4 text-left">
                  <h3 className="mb-2 text-center text-lg font-bold text-teal-900">Donation Details</h3>
                  <div className="flex justify-between border-b border-slate-200 py-2 text-sm"><span className="font-medium text-slate-700">Amount:</span><span className="font-semibold text-teal-900">NPR {donationDetails.amount}</span></div>
                  <div className="flex justify-between py-2 text-sm"><span className="font-medium text-slate-700">Payment ID:</span><span className="font-semibold text-teal-900">{donationDetails.pidx}</span></div>
                </div>
              )}

              <p className="mt-5 text-sm text-slate-500">Redirecting to dashboard in a few seconds...</p>
              <button onClick={handleContinue} className="mt-5 rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">
                {user ? 'Go to Dashboard Now' : 'Continue to Home'}
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div className="mb-4 text-3xl font-bold uppercase tracking-wide text-rose-600">Failed</div>
              <h2 className="text-3xl font-bold text-rose-600">Payment Verification Failed</h2>
              <p className="mt-3 text-slate-600">{message}</p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button onClick={() => navigate('/')} className="rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">Back to Home</button>
                <button onClick={() => navigate('/donate')} className="rounded-md bg-gradient-to-r from-amber-400 to-lime-500 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110">Try Again</button>
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