import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getPublicEvents } from '../services/eventService'

function Events() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getPublicEvents()
        setCampaigns(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err?.message || 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const handleDonate = (campaignId) => {
    if (user) {
      navigate('/donate', { state: { campaignId } })
    } else {
      localStorage.setItem('intendedPath', '/donate')
      navigate('/login')
    }
  }

  const formatCurrency = (amount = 0) => {
    if (amount >= 1000000) return `Rs ${(amount / 1000000).toFixed(1)}M`
    if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(0)},000`
    return `Rs ${amount}`
  }

  const formatDate = (value) => {
    if (!value) return 'TBA'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'TBA'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="relative h-[380px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Community gathering" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-8 left-6 z-10 text-white lg:left-12">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl font-bold uppercase tracking-wide">Programs</span>
            <span>/</span>
            <span>Home / Events / Campaign</span>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Recent Campaign</h2>
              <p className="mt-2 max-w-2xl text-slate-600">Join hands to create brighter futures. Find an event and make a difference today!</p>
            </div>
            <button className="rounded-md bg-emerald-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900">Admin Created Events</button>
          </div>

          {loading ? <p className="text-sm text-slate-600">Loading events...</p> : null}
          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
          {!loading && !error && campaigns.length === 0 ? <p className="text-sm text-slate-600">No events found.</p> : null}

          <div className="grid gap-6 lg:grid-cols-2">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="overflow-hidden rounded-xl bg-emerald-900 text-white shadow transition hover:-translate-y-1 hover:shadow-lg">
                <div className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-2xl font-bold">{campaign.title}</h3>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wide">{campaign.eventType || 'other'}</span>
                  </div>
                  <p className="text-sm text-emerald-100">{campaign.description || 'No description provided by admin.'}</p>

                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-emerald-200">Date</p>
                      <p className="font-semibold">{formatDate(campaign.eventDate)}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200">Location</p>
                      <p className="font-semibold">{campaign.location || 'TBA'}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200">Budget</p>
                      <p className="font-semibold">{formatCurrency(campaign.budget)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded bg-white/10 px-2 py-1 uppercase">{campaign.status || 'planned'}</span>
                    <span>Expected: {campaign.expectedParticipants || 0} participants</span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => handleDonate(campaign._id)} className="flex-1 rounded-md bg-lime-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-700">
                      {user ? 'Donate Now' : 'Login to Donate'}
                    </button>
                    <button className="flex-1 rounded-md border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-white/10">
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
