import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout as logoutService } from '../services/authService'

function Navbar() {
  const { user, logout: logoutContext } = useAuth()

  const handleLogout = () => {
    logoutService()
    logoutContext()
  }

  const navLinkClass = 'text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:text-emerald-600'

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700" />
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
          </div>
          <span className="text-lg font-bold text-slate-900">Mayaghar</span>
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center justify-start gap-4 lg:order-2 lg:w-auto lg:justify-center">
          <Link to="/" className={navLinkClass}>Home</Link>
          <a href="#about" className={navLinkClass}>About Us</a>
          <a href="#gallery" className={navLinkClass}>Gallery</a>
          <a href="#contact" className={navLinkClass}>Contact</a>
          <a href="#programs" className={navLinkClass}>Programs</a>
          <Link to="/events" className={navLinkClass}>Events/Campaigns</Link>
        </div>

        <div className="order-2 flex items-center gap-3 lg:order-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span>
              <Link to="/dashboard" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600">
                Login
              </Link>
              <Link to="/signup" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar