import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { login, googleLogin } from '../services/authService'
import { useAuth } from '../context/AuthContext'

function Login() {
  const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:5173'
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const googleSignInConfigured = Boolean(googleClientId)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login: loginContext } = useAuth()

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(formData.email, formData.password)
      handleAuthSuccess(response)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = (response) => {
    loginContext(response.user)

    if (response.user?.role === 'admin') {
      const next = new URLSearchParams(location.search).get('next') || '/home'
      const safeNext = next.startsWith('/') ? next : '/home'
      const params = new URLSearchParams({
        token: response.token,
        user: JSON.stringify(response.user),
      })
      window.location.assign(`${ADMIN_APP_URL}${safeNext}?${params.toString()}`)
      return
    }

    const intendedPath = localStorage.getItem('intendedPath')
    if (intendedPath) {
      localStorage.removeItem('intendedPath')
      navigate(intendedPath)
    } else {
      navigate('/home')
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
      handleAuthSuccess(response)
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
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 mx-auto w-full max-w-sm">
          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            {googleSignInConfigured ? (
              <div className={googleLoading ? 'pointer-events-none opacity-70' : ''}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
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
                  className="flex w-full max-w-[320px] items-center justify-center gap-3 rounded-md border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400"
                >
                  <span className="text-base font-semibold">G</span>
                  <span>Sign in with Google</span>
                </button>
                <p className="text-center text-xs text-amber-600">
                  Google sign-in is not configured yet. Set <code>VITE_GOOGLE_CLIENT_ID</code> in the user app env file.
                </p>
              </>
            )}
          </div>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
