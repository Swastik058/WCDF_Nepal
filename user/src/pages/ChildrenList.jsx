import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ChildCard from '../components/ChildCard'
import { fetchPublicChildren } from '../services/childrenService'

function ChildrenList() {
  const [children, setChildren] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchPublicChildren()
        setChildren(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unable to load children')
      } finally {
        setLoading(false)
      }
    }

    loadChildren()
  }, [])

  const filteredChildren = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return children

    return children.filter((child) =>
      (child.name || child.fullName || '').toLowerCase().includes(normalizedSearch)
    )
  }, [children, searchTerm])

  const availableCount = filteredChildren.filter((child) => !child.isSponsored).length

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_36%,#ecfdf5_100%)]">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-20 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Child Sponsorship</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Sponsor a child and directly support their year of care, education, and wellbeing.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
              Each profile shares a safe public overview along with the yearly sponsorship need so you can support a specific child with clarity and confidence.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
              <p className="text-sm text-slate-500">Published profiles</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{children.length}</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
              <p className="text-sm text-slate-500">Available for sponsorship</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">{availableCount}</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
              <p className="text-sm text-slate-500">Already sponsored</p>
              <p className="mt-2 text-3xl font-semibold text-amber-600">{Math.max(filteredChildren.length - availableCount, 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Children waiting for support</h2>
            <p className="mt-2 text-sm text-slate-600">
              Browse safe public profiles and choose a child to support through a full-year sponsorship.
            </p>
          </div>
          <label className="w-full max-w-md">
            <span className="sr-only">Search children</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              type="search"
              placeholder="Search by child name..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>

        {loading && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-700 shadow-sm">
            Loading child sponsorship profiles...
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && filteredChildren.length === 0 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-700 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No child profiles matched your search.</p>
            <p className="mt-2 text-sm text-slate-600">Try another name or check back later for new profiles.</p>
          </div>
        )}

        {!loading && !error && filteredChildren.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredChildren.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ChildrenList
