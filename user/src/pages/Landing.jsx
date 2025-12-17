import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { logout as logoutService } from '../services/authService'
import './Landing.css'

function Landing() {
  const { user, logout: contextLogout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutService()
    contextLogout()
    navigate('/login')
  }
  return (
    <div className="landing-container">
      {user ? (
        // Authenticated user navbar
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo-section">
              <div className="logo-graphic">
                <div className="logo-figure"></div>
                <div className="logo-figure"></div>
              </div>
              <span className="logo-text">माया घर</span>
            </div>
            <div className="nav-links">
              <a href="#home" className="nav-link active">HOME</a>
              <a href="#about" className="nav-link">ABOUT US</a>
              <a href="#gallery" className="nav-link">GALLERY</a>
              <a href="#contact" className="nav-link">CONTACT</a>
              <a href="#programs" className="nav-link">PROGRAMS</a>
              <a href="#events" className="nav-link">Events/Campaigns</a>
            </div>
            <div className="nav-user">
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </nav>
      ) : (
        // Public navbar
        <Navbar />
      )}
      
      
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-text">Small Act. Big Impact</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <button 
                className="donate-button" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Donate button clicked, navigating to /donate')
                  try {
                    navigate('/donate')
                  } catch (error) {
                    console.error('Navigation error:', error)
                  }
                }}
              >
                Donate Now
              </button>
              <a href="/donate" style={{ color: 'white', textDecoration: 'underline', fontSize: '14px' }}>
                Direct link to donate (test)
              </a>
            </div>
          </div>
        </div>
        <div className="facebook-widget">
          <span>facebook</span>
        </div>
      </section>

      {/* WCDF-NEPAL Introduction Section */}
      <section className="intro-section">
        <div className="intro-background">
          <div className="intro-overlay">
            <div className="intro-content">
              <h2 className="intro-title">WCDF-NEPAL</h2>
              <p className="intro-text">
                Established in 2067 B.S., the Women and Child Development Forum Nepal (WCDF-Nepal) is a non-profit organization dedicated to the welfare of vulnerable children and women across Nepal. At the heart of our work is Mayaghar.
              </p>
              <button className="read-more-button">Read More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Ongoing Project Section */}
      <section className="project-section">
        <div className="project-container">
          <div className="project-content">
            <h2 className="project-title">Our ongoing project</h2>
            <p className="project-text">
              We believe every child deserves a place to dream, learn, and grow safely. Our Building Project aims to create child-friendly homes and educational spaces that provide security, hope, and opportunities for vulnerable children across Nepal.
            </p>
            <button className="read-more-button">Read More</button>
          </div>
          <div className="project-image-container">
            <div className="building-drawing">
              <div className="building-title">EAST ELEVATION</div>
              <div className="building-structure">
                <div className="building-floor"></div>
                <div className="building-floor"></div>
                <div className="building-floor"></div>
                <div className="building-highlight"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Grid Section */}
      <section className="cta-grid-section">
        <div className="cta-grid">
          <div className="cta-card">
            <div className="cta-icon">$</div>
            <h3 className="cta-title">Make a DONATION</h3>
            <p className="cta-description">Support us in our various welfare programs</p>
          </div>
          <div className="cta-card">
            <div className="cta-icon">❤️</div>
            <h3 className="cta-title">Sponsor a Child</h3>
            <p className="cta-description">Every child you lift today lights up the world tomorrow.</p>
          </div>
          <div className="cta-card">
            <div className="cta-icon">👥</div>
            <h3 className="cta-title">Find about Our Programs</h3>
            <p className="cta-description">Learn about our various welfare programs</p>
          </div>
          <div className="cta-card">
            <div className="cta-icon">🤝</div>
            <h3 className="cta-title">Register to Volunteer</h3>
            <p className="cta-description">Signup as volunteer</p>
          </div>
        </div>
      </section>

      {/* Find us on Youtube Section */}
      <section className="youtube-section">
        <div className="youtube-container">
          <div className="youtube-left">
            <div className="youtube-logo">
              <div className="youtube-play-button"></div>
              <span className="youtube-text">YouTube</span>
            </div>
            <h2 className="youtube-title">Find us on Youtube</h2>
            <p className="youtube-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="youtube-right">
            <h2 className="youtube-title">Find us on Youtube</h2>
            <p className="youtube-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="map-container">
              <div className="map-placeholder">
                <div className="map-pin">📍</div>
                <div className="map-label">WCDF-Mayaghar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing

