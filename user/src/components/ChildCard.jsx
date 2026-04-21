import { Link } from 'react-router-dom'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80'
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

function ChildCard({ child }) {
  const destination = child.slug ? `/children/${child.slug}` : `/children/${child.id}`

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-64 overflow-hidden bg-slate-100">
        <img
          src={child.profileImage || PLACEHOLDER_IMAGE}
          alt={child.fullName}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{child.name || child.fullName}</h3>
            <p className="mt-1 text-sm text-slate-500">{child.age ? `${child.age} years old` : 'Age unavailable'}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
              child.isSponsored
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {child.isSponsored ? 'Sponsored' : 'Available'}
          </span>
        </div>
        <p className="min-h-[3.5rem] text-sm leading-6 text-slate-600">{child.description || child.shortBio || 'No story available yet.'}</p>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Yearly sponsorship cost</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(child.yearlyCost)}</p>
        </div>
        {child.interests?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {child.interests.slice(0, 3).map((interest) => (
              <span key={interest} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {interest}
              </span>
            ))}
          </div>
        )}
        <Link
          to={destination}
          className="inline-flex w-full justify-center rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          {child.isSponsored ? 'View Sponsored Profile' : 'View & Sponsor'}
        </Link>
      </div>
    </div>
  )
}

export default ChildCard
