import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { register, login, googleLogin } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function Signup() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const googleSignInConfigured = Boolean(googleClientId)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()
  const { login: loginContext } = useAuth()

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      await register(formData.name, formData.email, formData.password)
      const response = await login(formData.email, formData.password)
      loginContext(response.user)

      const intendedPath = localStorage.getItem('intendedPath')
      if (intendedPath) {
        localStorage.removeItem('intendedPath')
        navigate(intendedPath)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google login did not return a credential.')
      return
    }

    setError('')
    setGoogleLoading(true)

    try {
      const response = await googleLogin(credentialResponse.credential)
      loginContext(response.user)

      const intendedPath = localStorage.getItem('intendedPath')
      if (intendedPath) {
        localStorage.removeItem('intendedPath')
        navigate(intendedPath)
      } else {
        navigate('/home')
      }
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed to start.')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Sign Up</h2>
          <p className="mt-1 text-sm text-slate-600">Create a new account to get started.</p>

          {error && <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-800">Full Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-800">Email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-800">Password</label>
              <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="Enter your password (min. 6 characters)" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-800">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required minLength={6} placeholder="Confirm your password" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </div>

            <button type="submit" disabled={loading || googleLoading} className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            {googleSignInConfigured ? (
              <div className={googleLoading ? 'pointer-events-none opacity-70' : ''}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="320"
                />
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  className="flex w-full max-w-[320px] items-center justify-center gap-3 rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-400"
                >
                  <span className="text-base font-semibold">G</span>
                  <span>Sign up with Google</span>
                </button>
                <p className="text-center text-xs text-amber-600">
                  Google sign-in is not configured yet. Set <code>VITE_GOOGLE_CLIENT_ID</code> in the user app env file.
                </p>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
