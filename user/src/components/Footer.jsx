import './Footer.css'

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo-section">
            <div className="logo-graphic">
              <div className="logo-figure"></div>
              <div className="logo-figure"></div>
            </div>
            <span className="logo-text">माया घर</span>
          </div>
          <p className="footer-name">Mayaghar</p>
          <p className="footer-copyright">©2025 WCDF-Nepal. All rights reserved</p>
        </div>
        <div className="footer-right">
          <div className="footer-nav">
            <a href="#home" className="footer-link">HOME</a>
            <a href="#about" className="footer-link">About Us</a>
            <a href="#gallery" className="footer-link">Gallery</a>
            <a href="#contact" className="footer-link">Contact</a>
            <a href="#programs" className="footer-link">Programs</a>
            <a href="#events" className="footer-link">Events/Campaign</a>
          </div>
          <div className="footer-contact">
            <h3 className="footer-heading">Get in Touch</h3>
            <p className="footer-email">wcdf-mayaghar@gmail.com</p>
            <div className="footer-social">
              <div className="social-icon"></div>
              <div className="social-icon"></div>
              <div className="social-icon"></div>
            </div>
            <div className="footer-buttons">
              <button className="footer-btn">Grayscale</button>
              <button className="footer-btn">भाषा</button>
            </div>
          </div>
          <div className="footer-legal">
            <a href="#terms" className="legal-link">Terms & Condition</a>
            <a href="#privacy" className="legal-link">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

