import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProgramsHubSection from '../components/ProgramsHubSection'
import { useAuth } from '../context/AuthContext'
import { getPublicDonationStats } from '../services/donationService'

function useCountUp(target, duration = 2200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!target) return
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

function DonationTicker({ totalRaised, donorCount }) {
  const animatedTotal = useCountUp(totalRaised)
  const animatedCount = useCountUp(donorCount, 1800)

  return (
    <div className="absolute right-4 top-4 z-20 sm:right-16">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/55 px-5 py-4 text-white backdrop-blur-md shadow-xl"
        style={{ minWidth: 180 }}
      >
        {/* Animated glow ring */}
        <span className="pointer-events-none absolute -inset-px rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(52,211,153,0.25) 0%, transparent 60%)',
            animation: 'pulseGlow 2.8s ease-in-out infinite',
          }}
        />

        {/* Live dot */}
        <div className="mb-2 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300">Live Total</span>
        </div>

        {/* Amount */}
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">Total Raised</p>
        <p className="mt-0.5 text-2xl font-extrabold leading-none tracking-tight text-white">
          NPR{' '}
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {animatedTotal.toLocaleString('en-NP')}
          </span>
        </p>

        {/* Donor count */}
        <p className="mt-2 text-[11px] text-white/60">
          <span className="font-bold text-white/90">{animatedCount.toLocaleString()}</span> donors
        </p>

        {/* Bottom shimmer bar */}
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
            style={{ animation: 'shimmer 2s ease-in-out infinite' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { width: 20%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 20%; margin-left: 80%; }
        }
      `}</style>
    </div>
  )
}

function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [donationStats, setDonationStats] = useState({ totalRaised: 0, donorCount: 0 })

  useEffect(() => {
    getPublicDonationStats()
      .then((data) => setDonationStats(data))
      .catch(() => {})
  }, [])

  const handleDonate = () => {
    if (user) {
      navigate('/donate')
    } else {
      localStorage.setItem('intendedPath', '/donate')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/45" />
        <DonationTicker totalRaised={donationStats.totalRaised} donorCount={donationStats.donorCount} />
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow sm:text-5xl">Small Act. Big Impact</h1>
          <button onClick={handleDonate} className="rounded-md bg-gradient-to-r from-amber-400 to-lime-500 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:-translate-y-0.5">
            {user ? 'Donate Now' : 'Login to Donate'}
          </button>
        </div>
        <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 bg-blue-600 px-2 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white md:block [writing-mode:vertical-rl]">
          facebook
        </div>
      </section>

      <section className="relative min-h-[460px] bg-[url('https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
        <div className="flex min-h-[460px] items-center justify-end bg-black/50 px-6 py-12 lg:px-16">
          <div className="max-w-2xl rounded-lg bg-black/70 p-8 text-white">
            <h2 className="text-3xl font-bold">WCDF-NEPAL</h2>
            <p className="mt-4 leading-7 text-slate-100">
              Established in 2067 B.S., the Women and Child Development Forum Nepal (WCDF-Nepal) is a non-profit organization dedicated to the welfare of vulnerable children and women across Nepal. At the heart of our work is Mayaghar.
            </p>
            <button  onClick={() => navigate('/about')} className="mt-6 rounded-md bg-gradient-to-r from-amber-400 to-lime-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:-translate-y-0.5">Read More</button>
          </div>
        </div>
      </section>

      <section className="bg-slate-800 px-6 py-16 text-white lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Our ongoing project</h2>
            <p className="mt-4 leading-7 text-slate-100">
              We believe every child deserves a place to dream, learn, and grow safely. Our Building Project aims to create child-friendly homes and educational spaces that provide security, hope, and opportunities for vulnerable children across Nepal.
            </p>
            <button className="mt-6 rounded-md bg-gradient-to-r from-amber-400 to-lime-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white">Read More</button>
          </div>
          <div className="rounded-lg bg-white p-6 text-slate-800 shadow-lg">
            <div className="rounded border-2 border-slate-300">
              <div className="border-b-2 border-slate-300 p-3 text-center text-sm font-bold">EAST ELEVATION</div>
              <div className="relative space-y-3 p-4">
                <div className="h-20 rounded border border-slate-300 bg-slate-100" />
                <div className="h-20 rounded border border-slate-300 bg-slate-100" />
                <div className="h-20 rounded border border-slate-300 bg-slate-100" />
                <div className="absolute right-4 top-4 h-[240px] w-20 rounded border-2 border-red-900 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_8px,#991b1b_8px,#991b1b_16px)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-teal-900 px-6 py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <button onClick={handleDonate} className="rounded-lg border border-white/30 bg-white/5 p-8 text-center text-white transition hover:-translate-y-1 hover:border-white/60">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-sm font-bold">$</div>
            <h3 className="text-xl font-bold">Make a Donation</h3>
            <p className="mt-2 text-sm text-white/80">{user ? 'Support us in our welfare programs.' : 'Login to support our welfare programs.'}</p>
          </button>
          <button onClick={() => navigate('/children')} className="rounded-lg border border-white/30 bg-white/5 p-8 text-center text-white transition hover:-translate-y-1 hover:border-white/60">
          {/* <div className="rounded-lg border border-white/30 bg-white/5 p-8 text-center text-white"></div> */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase">Heart</div>
            <h3 className="text-xl font-bold">Sponsor a Child</h3>
            <p className="mt-2 text-sm text-white/80">Every child you lift today lights up the world tomorrow.</p>
          
          </button>
          <button onClick={() => navigate('/programs')} className="rounded-lg border border-white/30 bg-white/5 p-8 text-center text-white transition hover:-translate-y-1 hover:border-white/60">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase">People</div>
            <h3 className="text-xl font-bold">Find our Programs</h3>
            <p className="mt-2 text-sm text-white/80">Learn about our welfare programs.</p>
          </button>
          <button onClick={() => navigate('/volunteer/dashboard')} className="rounded-lg border border-white/30 bg-white/5 p-8 text-center text-white transition hover:-translate-y-1 hover:border-white/60">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase">Help</div>
            <h3 className="text-xl font-bold">Register to Volunteer</h3>
            <p className="mt-2 text-sm text-white/80">Sign up as a volunteer.</p>
          </button>
        </div>
      </section>

      {/* <ProgramsHubSection /> */}

      <section className="bg-white px-6 py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="relative h-10 w-14 rounded-lg bg-red-600 after:absolute after:left-[22px] after:top-1/2 after:-translate-y-1/2 after:border-y-[8px] after:border-l-[12px] after:border-y-transparent after:border-l-white" />
              <span className="text-2xl font-bold">YouTube</span>
            </div>
            <h2 className="text-3xl font-bold">Find us on Youtube</h2>
            <p className="mt-3 text-slate-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold">Find us on Map</h2>
            <p className="mt-3 text-slate-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <div className="mt-6 flex h-72 items-center justify-center rounded-lg border-2 border-slate-300 bg-gradient-to-br from-sky-100 to-blue-200">
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-teal-800">Location</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">WCDF-Mayaghar</p>
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
