import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchPublicChild } from '../services/childrenService'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80'

function ChildProfile() {
  const { identifier } = useParams()
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChild = async () => {
      try {
        setLoading(true)
        const data = await fetchPublicChild(identifier)
        setChild(data.child)
      } catch (err) {
        setError(err.message || 'Profile not found')
      } finally {
        setLoading(false)
      }
    }

    loadChild()
  }, [identifier])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/children"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          ← Back to children
        </Link>

        {loading && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-700 shadow-sm">
            Loading profile...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-12 text-center text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {child && (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="h-80 overflow-hidden bg-slate-100 sm:h-[28rem]">
              <img
                src={child.profileImage || PLACEHOLDER_IMAGE}
                alt={child.fullName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-8 p-8 lg:p-12">
              <div className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">{child.fullName}</h1>
                    <p className="mt-2 text-sm uppercase tracking-[0.3em] text-emerald-700">Current resident</p>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    {child.age ? `${child.age} years old` : 'Age not shown'}
                  </div>
                </div>

                <p className="max-w-3xl text-lg leading-8 text-slate-600">{child.shortBio || 'At this time, this child’s profile is being shared with respect and care for the family.'}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Profile details</h2>
                  <dl className="mt-5 space-y-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
                      <dt className="font-medium text-slate-800">Gender</dt>
                      <dd>{child.gender || 'Not specified'}</dd>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
                      <dt className="font-medium text-slate-800">Joined year</dt>
                      <dd>{child.joinedYear || 'N/A'}</dd>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white p-4">
                      <dt className="font-medium text-slate-800">Public status</dt>
                      <dd className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Currently residing</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Interests</h2>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {child.interests?.length > 0 ? (
                      child.interests.map((interest) => (
                        <span key={interest} className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Interests are being updated.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-semibold text-slate-900">About this profile</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  The information shown here is intended for public awareness and is kept safe. Sensitive details are not shared to protect the child’s privacy.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ChildProfile
