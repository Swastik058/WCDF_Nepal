import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { initiateKhaltiDonation } from '../services/donationService'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchPublicChild } from '../services/childrenService'

const DONATION_PURPOSES = [
  { value: 'General donation', label: 'General Support' },
  { value: 'Child education', label: 'Child Education' },
  { value: 'Healthcare', label: 'Healthcare Support' },
  { value: 'Food and nutrition', label: 'Food & Nutrition' },
  { value: 'Building project', label: 'Building Project' },
  { value: 'Emergency relief', label: 'Emergency Relief' },
  { value: 'Other', label: 'Other' },
]

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000]

function Donate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const sponsorshipChildId = searchParams.get('childId')

  const [formData, setFormData] = useState({
    donorName: user?.name || '',
    email: user?.email || '',
    amount: '',
    purpose: 'General donation',
    description: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null)
  const [sponsorshipChild, setSponsorshipChild] = useState(null)
  const [childLoading, setChildLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const paymentStatus = searchParams.get('payment')
    const reason = searchParams.get('reason')
    const errorType = searchParams.get('error')

    if (paymentStatus === 'failed') {
      let errorMessage = 'Payment failed. Please try again.'

      if (reason) errorMessage = `Payment failed: ${reason}`
      else if (errorType === 'verification_failed') errorMessage = 'Payment verification failed due to network issues. Please try again.'
      else if (errorType === 'missing_pidx') errorMessage = 'Payment verification failed: Missing payment ID. Please try again.'
      else if (errorType === 'donation_not_found') errorMessage = 'Payment verification failed: Donation record not found. Please contact support.'

      setError(errorMessage)
      setSearchParams({})
    }
  }, [user, navigate, searchParams, setSearchParams])

  useEffect(() => {
    const loadSponsorshipChild = async () => {
      if (!sponsorshipChildId) {
        setSponsorshipChild(null)
        return
      }

      try {
        setChildLoading(true)
        setError('')
        const child = await fetchPublicChild(sponsorshipChildId)
        setSponsorshipChild(child)

        if (child.isSponsored) {
          setError('This child has already been sponsored.')
          return
        }

        setFormData((prev) => ({
          ...prev,
          amount: child.yearlyCost ? String(child.yearlyCost) : prev.amount,
          purpose: `Child Sponsorship: ${child.name || child.fullName}`,
        }))
        setSelectedQuickAmount(null)
      } catch (err) {
        setSponsorshipChild(null)
        setError(err.message || 'Unable to load the selected child for sponsorship.')
      } finally {
        setChildLoading(false)
      }
    }

    loadSponsorshipChild()
  }, [sponsorshipChildId])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')

    if (e.target.name === 'amount') {
      setSelectedQuickAmount(null)
    }
  }

  const handleQuickAmount = (amount) => {
    setFormData((prev) => ({ ...prev, amount: amount.toString() }))
    setSelectedQuickAmount(amount)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.donorName.trim() || !formData.email.trim() || !formData.amount) {
        throw new Error('Please fill in all required fields')
      }

      if (parseFloat(formData.amount) < 10) {
        throw new Error('Minimum donation amount is NPR 10')
      }

      if (sponsorshipChild?.isSponsored) {
        throw new Error('This child has already been sponsored.')
      }

      const response = await initiateKhaltiDonation({
        donorName: formData.donorName.trim(),
        email: formData.email.trim(),
        amount: parseFloat(formData.amount),
        purpose: formData.purpose || 'General donation',
        description: formData.description.trim(),
        childId: sponsorshipChild?.id,
      })

      if (response.payment_url) {
        window.location.href = response.payment_url
      } else {
        throw new Error('Invalid payment URL received')
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate Khalti payment')
      setLoading(false)
    }
  }

  const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

  const impactItems = sponsorshipChild
    ? [
        { icon: 'Edu', amount: `NPR ${Number(sponsorshipChild.costBreakdown?.education || 0).toLocaleString()}`, text: 'Supports school fees, supplies, and learning materials' },
        { icon: 'Food', amount: `NPR ${Number(sponsorshipChild.costBreakdown?.food || 0).toLocaleString()}`, text: 'Helps provide meals and nutrition through the year' },
        { icon: 'Care', amount: `NPR ${Number(sponsorshipChild.costBreakdown?.healthcare || 0).toLocaleString()}`, text: 'Contributes to healthcare and wellness support' },
        { icon: 'Home', amount: `NPR ${Number(sponsorshipChild.costBreakdown?.shelter || 0).toLocaleString()}`, text: 'Helps maintain safe shelter and daily living support' },
      ]
    : [
        { icon: 'Food', amount: 'NPR 500', text: 'Provides meals for a child for a week' },
        { icon: 'Edu', amount: 'NPR 1,000', text: 'Covers school supplies for a month' },
        { icon: 'Health', amount: 'NPR 2,000', text: 'Supports healthcare for a family' },
        { icon: 'Home', amount: 'NPR 5,000', text: 'Contributes to shelter improvements' },
      ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#0f3b35,#14532d_55%,#854d0e)] px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_28%)]" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {sponsorshipChild ? 'Sponsor a Child Today' : 'Make a Difference Today'}
          </h1>
          <p className="max-w-3xl text-lg text-white/90">
            {sponsorshipChild
              ? 'Complete a full-year sponsorship for a specific child through our secure Khalti payment flow.'
              : 'Your donation helps us provide better care and support to children and women in need across Nepal.'}
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[2fr_1fr] lg:px-12">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-teal-900">{sponsorshipChild ? 'Sponsor This Child' : 'Donate Now'}</h2>
            <p className="mt-2 text-slate-600">
              {sponsorshipChild
                ? 'You are about to fund this child’s full yearly sponsorship.'
                : "Every contribution makes a meaningful impact in someone's life."}
            </p>
          </div>

          {error && <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {childLoading && <div className="mb-6 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">Loading sponsorship details...</div>}

          {sponsorshipChild && !childLoading ? (
            <div className="mb-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Selected child</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{sponsorshipChild.name || sponsorshipChild.fullName}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Yearly sponsorship cost: <span className="font-semibold text-slate-900">NPR {Number(sponsorshipChild.yearlyCost || 0).toLocaleString()}</span>
                  </p>
                </div>
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
                  Child Sponsorship
                </span>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="border-b border-slate-200 pb-6">
              <h3 className="mb-4 text-xl font-semibold text-teal-900">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="donorName" className="text-sm font-medium text-slate-700">Full Name *</label>
                  <input id="donorName" name="donorName" type="text" value={formData.donorName} onChange={handleChange} required placeholder="Enter your full name" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address *</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" className={inputClass} />
                </div>
              </div>
            </section>

            <section className="border-b border-slate-200 pb-6">
              <h3 className="mb-4 text-xl font-semibold text-teal-900">{sponsorshipChild ? 'Sponsorship Amount' : 'Donation Amount'}</h3>
              {!sponsorshipChild ? (
                <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {QUICK_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmount(amount)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        selectedQuickAmount === amount
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-teal-500'
                      }`}
                    >
                      NPR {amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              ) : null}
              <div>
                <label htmlFor="amount" className="text-sm font-medium text-slate-700">{sponsorshipChild ? 'Yearly sponsorship amount (NPR) *' : 'Custom Amount (NPR) *'}</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter custom amount"
                  required
                  min="10"
                  disabled={Boolean(sponsorshipChild)}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {sponsorshipChild ? 'This amount matches the yearly sponsorship cost for the selected child.' : 'Minimum donation: NPR 10'}
                </p>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xl font-semibold text-teal-900">{sponsorshipChild ? 'Sponsorship Notes' : 'Donation Purpose'}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="purpose" className="text-sm font-medium text-slate-700">{sponsorshipChild ? 'Donation purpose' : 'How would you like your donation to be used?'}</label>
                  {sponsorshipChild ? (
                    <input
                      id="purpose"
                      name="purpose"
                      type="text"
                      value={formData.purpose}
                      readOnly
                      className={`${inputClass} bg-slate-100`}
                    />
                  ) : (
                    <select id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} className={inputClass}>
                      {DONATION_PURPOSES.map((purpose) => (
                        <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium text-slate-700">{sponsorshipChild ? 'Message to WCDF (Optional)' : 'Additional Message (Optional)'}</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={sponsorshipChild ? 'Share a note for the sponsorship team...' : "Share why you're donating or any special message..."}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading || childLoading || sponsorshipChild?.isSponsored}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-700 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Redirecting to Khalti...
                </>
              ) : (
                <>
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-white text-xs font-bold text-violet-700">K</span>
                  Pay with Khalti
                </>
              )}
            </button>
          </form>
        </div>

        <aside className="h-fit rounded-2xl border border-teal-100 bg-white p-6 shadow lg:sticky lg:top-24">
          <h3 className="mb-5 text-center text-2xl font-bold text-teal-900">{sponsorshipChild ? 'Sponsorship Impact' : 'Your Impact'}</h3>
          <div className="space-y-3">
            {impactItems.map((item) => (
              <div key={item.icon} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[11px] font-bold uppercase text-teal-800 shadow">{item.icon}</div>
                <div>
                  <p className="text-sm font-bold text-teal-900">{item.amount}</p>
                  <p className="text-xs text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  )
}

export default Donate
