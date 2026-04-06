import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ChildCard from '../components/ChildCard'
import { fetchPublicChildren } from '../services/childrenService'

function Children() {
  const [children, setChildren] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true)
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
    return children.filter((child) =>
      child.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [children, searchTerm])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),transparent_46%)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Our Children</p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Meet the children who call our home their safe space.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600">
            We share only current, published profiles here. Every profile is carefully curated so the information stays warm, respectful, and public-safe.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Children in residence</h2>
            <p className="mt-2 text-sm text-slate-600">Browse child profiles that are active and approved for public sharing.</p>
          </div>
          <label className="w-full max-w-md">
            <span className="sr-only">Search children</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              type="search"
              placeholder="Search by name..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-700 shadow-sm">
            Loading children profiles...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && filteredChildren.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-700 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No child profiles available.</p>
            <p className="mt-2 text-sm text-slate-600">Please check back later for new stories and updates.</p>
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

export default Children
