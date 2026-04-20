import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { login, googleLogin } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!formData.password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const normalizedEmail = formData.email.toLowerCase()
      const response = await login(normalizedEmail, formData.password)
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
      const next = new URLSearchParams(location.search).get('next') || '/dashboard'
      const safeNext = next.startsWith('/') ? next : '/dashboard'
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
      <Navbar />

      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#0f3b35,#14532d_55%,#854d0e)] px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_28%)]" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Sign In</h1>
          <p className="max-w-3xl text-lg text-white/90">Access your account to donate, volunteer, and more.</p>
        </div>
      </section>

      <div className="flex min-h-[calc(100vh-540px)] items-center justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-slate-600">Or start your journey with us</p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            {error && (
              <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-semibold text-emerald-600 hover:text-emerald-500">
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
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="flex w-full justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
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
                    className="flex w-full max-w-[320px] items-center justify-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-400"
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

            <p className="mt-6 text-center text-sm text-slate-600">
              Not a member?{' '}
              <Link to="/signup" className="font-semibold text-emerald-600 hover:text-emerald-500">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Login
