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
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex flex-shrink-0 items-center gap-2">
          <div className="h-10 w-10 rounded-full border-2 border-emerald-500">
            <img src="/mayaghar.jpg" alt="" />
          </div>
          <span className="text-lg font-bold text-slate-900">WCDF-Nepal</span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-5 xl:flex">
          <Link to="/" className={navLinkClass}>Home</Link>
          <Link to="/about" className={navLinkClass}>About Us</Link>
          <Link to="/children" className={navLinkClass}>Children</Link>
          <Link to="/gallery" className={navLinkClass}>Gallery</Link>
          <Link to="/contact" className={navLinkClass}>Contact</Link>
          <Link to="/programs" className={navLinkClass}>Programs</Link>
          <Link to="/events" className={navLinkClass}>Events/Campaigns</Link>
          <Link to="/transparency" className={navLinkClass}>Transparency</Link>
        </div>

        {/* User controls */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span>
              {user?.volunteerStatus === 'approved' ? (
                <Link to="/volunteer/dashboard" className="rounded-md border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-800">
                  Volunteer
                </Link>
              ) : (
                <Link to="/volunteer/apply" className="rounded-md border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-800">
                  Become a Volunteer
                </Link>
              )}
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
