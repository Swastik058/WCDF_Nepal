import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchPublicChild } from '../services/childrenService'
import { useAuth } from '../context/AuthContext'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

function ChildDetails() {
  const { identifier } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChild = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchPublicChild(identifier)
        setChild(data)
      } catch (err) {
        setError(err.message || 'Profile not found')
      } finally {
        setLoading(false)
      }
    }

    loadChild()
  }, [identifier])

  const breakdownItems = useMemo(() => {
    const costBreakdown = child?.costBreakdown || {}
    const items = [
      { key: 'education', label: 'Education', value: costBreakdown.education || 0 },
      { key: 'food', label: 'Food', value: costBreakdown.food || 0 },
      { key: 'healthcare', label: 'Healthcare', value: costBreakdown.healthcare || 0 },
      { key: 'shelter', label: 'Shelter', value: costBreakdown.shelter || 0 },
      { key: 'others', label: 'Others', value: costBreakdown.others || 0 },
    ]
    const total = items.reduce((sum, item) => sum + item.value, 0)

    return items.map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }))
  }, [child])

  const handleSponsorClick = () => {
    if (!child) return

    const sponsorshipPath = `/donate?childId=${child.id}`
    if (!user) {
      localStorage.setItem('intendedPath', sponsorshipPath)
      navigate('/login')
      return
    }

    navigate(sponsorshipPath)
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_30%,#ecfeff_100%)]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/children"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back to children
        </Link>

        {loading && (
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-700 shadow-sm">
            Loading child profile...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-[2rem] border border-rose-200 bg-rose-50 p-12 text-center text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {child && (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="h-80 bg-slate-100 lg:h-full">
                <img
                  src={child.image || child.profileImage || PLACEHOLDER_IMAGE}
                  alt={child.name || child.fullName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between bg-[linear-gradient(180deg,#0f3b35_0%,#14532d_100%)] p-8 text-white lg:p-10">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                      {child.isSponsored ? 'Already sponsored' : 'Available for sponsorship'}
                    </span>
                    <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                      {child.age ? `${child.age} years old` : 'Age not shown'}
                    </span>
                  </div>

                  <h1 className="mt-6 text-4xl font-bold tracking-tight">{child.name || child.fullName}</h1>
                  <p className="mt-4 text-base leading-8 text-white/85">
                    {child.description || child.shortBio || 'This child profile is shared carefully to help supporters understand the impact of sponsorship.'}
                  </p>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-100">Yearly sponsorship cost</p>
                  <p className="mt-3 text-4xl font-semibold">{formatCurrency(child.yearlyCost)}</p>
                  <p className="mt-3 text-sm leading-7 text-white/80">
                    Sponsorship covers essentials like schooling, nutrition, healthcare, shelter, and daily support for one full year.
                  </p>
                  <button
                    type="button"
                    onClick={handleSponsorClick}
                    disabled={child.isSponsored}
                    className="mt-6 w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/70"
                  >
                    {child.isSponsored ? 'Already Sponsored' : 'Sponsor this Child'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
              <div className="space-y-6">
                <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Child details</h2>
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</dt>
                      <dd className="mt-2 text-sm font-semibold text-slate-900">{child.name || child.fullName}</dd>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Age</dt>
                      <dd className="mt-2 text-sm font-semibold text-slate-900">{child.age ? `${child.age} years` : 'Not shown'}</dd>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Joined year</dt>
                      <dd className="mt-2 text-sm font-semibold text-slate-900">{child.joinedYear || 'N/A'}</dd>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Sponsorship status</dt>
                      <dd className="mt-2 text-sm font-semibold text-slate-900">{child.isSponsored ? 'Sponsored' : 'Open for sponsorship'}</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Why sponsorship matters</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Sponsorship gives WCDF a reliable yearly commitment for this child, helping the team plan school support, meals, healthcare, and daily care with more stability.
                  </p>
                </section>
              </div>

              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">Cost breakdown</h2>
                <div className="mt-5 space-y-4">
                  {breakdownItems.map((item) => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ChildDetails
