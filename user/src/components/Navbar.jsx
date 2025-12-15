import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout as logoutService } from '../services/authService'
import './Navbar.css'

function Navbar() {
  const { user, logout: logoutContext } = useAuth()

  const handleLogout = () => {
    logoutService()
    logoutContext()
  }

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="logo-section">
          <div className="logo-graphic">
            <div className="logo-figure"></div>
            <div className="logo-figure"></div>
          </div>
          <span className="logo-text">माया घर</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">HOME</Link>
          <a href="#about" className="nav-link">ABOUT US</a>
          <a href="#gallery" className="nav-link">GALLERY</a>
          <a href="#contact" className="nav-link">CONTACT</a>
          <a href="#programs" className="nav-link">PROGRAMS</a>
          <a href="#events" className="nav-link">Events/Campaigns</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <Link to="/home" className="login-link">Dashboard</Link>
              <button onClick={handleLogout} className="signup-link">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/signup" className="signup-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

