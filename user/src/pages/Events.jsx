import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Events.css'

// Sample campaign data - in production, this would come from an API
const CAMPAIGNS = [
  {
    id: 1,
    title: "Sponsoring a child",
    image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    raised: 700000,
    remaining: 700000,
    target: 1400000,
    expireDate: "19 Dec, 2025",
    progress: 50,
    category: "Child Sponsorship",
    description: "Help us provide education, healthcare, and a safe environment for children in need."
  },
  {
    id: 2,
    title: "Build a safe shelter",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    raised: 2500000,
    remaining: 1230000,
    target: 3730000,
    expireDate: "23 Apr, 2026",
    progress: 67,
    category: "Infrastructure",
    description: "Building safe and secure shelter facilities for vulnerable children and families."
  }
]

function Events() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState(CAMPAIGNS)
  const [filter, setFilter] = useState('all')

  const handleDonate = (campaignId) => {
    if (user) {
      navigate('/donate', { state: { campaignId } })
    } else {
      localStorage.setItem('intendedPath', '/donate')
      navigate('/login')
    }
  }

  const filteredCampaigns = filter === 'all' 
    ? campaigns 
    : campaigns.filter(campaign => campaign.category.toLowerCase() === filter)

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `Rs ${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 100000) {
      return `Rs ${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `Rs ${(amount / 1000).toFixed(0)},000`
    }
    return `Rs ${amount}`
  }

  return (
    <div className="events-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="events-hero">
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Community gathering" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="breadcrumb">
              <span>Programs</span>
              <span>/</span>
              <span>Home / Events / Campaign</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Campaign Section */}
      <section className="recent-campaign">
        <div className="campaign-container">
          <div className="campaign-header">
            <div className="header-content">
              <h2>RECENT CAMPAIGN</h2>
              <p>Join hands to create brighter futures. Find an event and make a difference today!</p>
            </div>
            <button className="view-all-btn">View all Campaign</button>
          </div>

          {/* Campaign Cards */}
          <div className="campaigns-grid">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-image">
                  <img src={campaign.image} alt={campaign.title} />
                </div>
                
                <div className="campaign-content">
                  <h3 className="campaign-title">{campaign.title}</h3>
                  
                  <div className="campaign-stats">
                    <div className="stat-row">
                      <div className="stat-item">
                        <span className="stat-label">Raised</span>
                        <span className="stat-value">{formatCurrency(campaign.raised)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Remaining</span>
                        <span className="stat-value">{formatCurrency(campaign.remaining)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Expire Date</span>
                        <span className="stat-value">{campaign.expireDate}</span>
                      </div>
                    </div>
                    
                    <div className="progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-info">
                        <span className="progress-text">Raised Funds</span>
                        <span className="progress-percentage">{campaign.progress}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="campaign-actions">
                    <button 
                      className="donate-now-btn"
                      onClick={() => handleDonate(campaign.id)}
                    >
                      {user ? 'Donate Now' : 'Login to Donate'}
                    </button>
                    <button className="program-details-btn">
                      Program Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Events