import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function AboutUs() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow sm:text-5xl">About Us</h1>
          <p className="max-w-2xl text-lg text-white/90">Learn more about our mission and vision for vulnerable children and women</p>
        </div>
      </section>

      {/* Organization Overview */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-3xl font-bold text-slate-900">Who We Are</h2>
          <p className="mb-4 text-lg leading-8 text-slate-700">
            Established in 2067 B.S., the Women and Child Development Forum Nepal (WCDF-Nepal) is a non-profit organization dedicated to the welfare of vulnerable children and women across Nepal. Our primary initiative, Mayaghar, serves as a beacon of hope for children in need.
          </p>
          <p className="text-lg leading-8 text-slate-700">
            We believe that every child deserves a safe place to grow, learn, and dream. Through our comprehensive programs and dedicated team, we provide shelter, education, healthcare, and support to the most vulnerable populations in our community.
          </p>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="bg-slate-50 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="leading-8 text-slate-700">
                To provide compassionate care, education, and support to vulnerable children and women in Nepal, empowering them to build better futures and contributing to a more equitable society.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="leading-8 text-slate-700">
                A world where every child grows in a safe, supportive environment with access to quality education, healthcare, and opportunities to realize their full potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-3xl font-bold text-slate-900">Our Core Values</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-3 text-lg font-bold text-emerald-600">Compassion</h4>
              <p className="leading-6 text-slate-600">We approach our work with empathy and genuine care for every child and woman we serve.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-3 text-lg font-bold text-emerald-600">Integrity</h4>
              <p className="leading-6 text-slate-600">We operate with transparency and accountability in all our programs and financial dealings.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-3 text-lg font-bold text-emerald-600">Empowerment</h4>
              <p className="leading-6 text-slate-600">We believe in giving individuals the tools and support they need to reach their full potential.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-3 text-lg font-bold text-emerald-600">Collaboration</h4>
              <p className="leading-6 text-slate-600">We work together with partners, volunteers, and donors to amplify our impact.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-3 text-lg font-bold text-emerald-600">Sustainability</h4>
              <p className="leading-6 text-slate-600">We focus on creating long-term, sustainable solutions that benefit communities for years to come.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-3 text-lg font-bold text-emerald-600">Social Justice</h4>
              <p className="leading-6 text-slate-600">We advocate for the rights and dignity of vulnerable populations in our society.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Programs */}
      <section className="bg-slate-50 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-3xl font-bold text-slate-900">Our Programs</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <span className="text-xl font-bold">🏠</span>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-slate-900">Mayaghar - Child Shelter</h4>
                <p className="leading-6 text-slate-600">Providing safe shelter, nutritious meals, and a nurturing home environment for vulnerable children.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <span className="text-xl font-bold">📚</span>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-slate-900">Education Program</h4>
                <p className="leading-6 text-slate-600">Offering quality education, skill training, and scholarships to help children pursue their dreams.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <span className="text-xl font-bold">🏥</span>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-slate-900">Healthcare Initiatives</h4>
                <p className="leading-6 text-slate-600">Ensuring access to quality healthcare, nutrition, and health education for all our beneficiaries.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <span className="text-xl font-bold">👩</span>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xl font-bold text-slate-900">Women Empowerment</h4>
                <p className="leading-6 text-slate-600">Supporting women through livelihood training, economic empowerment, and community awareness programs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="bg-teal-900 px-6 py-16 text-white lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-3xl font-bold">Our Impact</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-amber-400">200+</div>
              <p className="text-white/80">Children Supported</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-amber-400">150+</div>
              <p className="text-white/80">Women Empowered</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-amber-400">500+</div>
              <p className="text-white/80">Volunteers Active</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-amber-400">15+</div>
              <p className="text-white/80">Years of Service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">Join Our Mission</h2>
          <p className="mb-8 text-lg text-slate-600">
            There are many ways you can make a difference in the lives of vulnerable children and women.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a href="/donate" className="rounded-md bg-emerald-600 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-700">
              Make a Donation
            </a>
            <a href="/volunteer/apply" className="rounded-md border border-emerald-600 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-600 transition hover:bg-emerald-50">
              Become a Volunteer
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutUs
