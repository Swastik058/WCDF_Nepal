import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.message) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // For now, just simulate a successful submission
      // In a real application, you would send this to a backend API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow sm:text-5xl">Contact Us</h1>
          <p className="max-w-2xl text-lg text-white/90">We'd love to hear from you. Get in touch with us today.</p>
        </div>
      </section>

      {/* Contact Information and Form */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div>
              <h2 className="mb-8 text-3xl font-bold text-slate-900">Get in Touch</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="mb-2 flex items-center gap-3 text-lg font-semibold text-slate-900">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      📍
                    </span>
                    Address
                  </h3>
                  <p className="ml-13 text-slate-600">
                    Mayaghar, WCDF-Nepal<br />
                    Kathmandu, Nepal
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-3 text-lg font-semibold text-slate-900">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      ☎️
                    </span>
                    Phone
                  </h3>
                  <p className="ml-13 text-slate-600">
                    <a href="tel:+977-1-1234567" className="transition hover:text-emerald-600">
                      +977-1-1234567
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-3 text-lg font-semibold text-slate-900">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      ✉️
                    </span>
                    Email
                  </h3>
                  <p className="ml-13 text-slate-600">
                    <a href="mailto:info@mayaghar.org" className="transition hover:text-emerald-600">
                      info@mayaghar.org
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-3 text-lg font-semibold text-slate-900">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      🕐
                    </span>
                    Office Hours
                  </h3>
                  <p className="ml-13 text-slate-600">
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday: 10:00 AM - 3:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-10">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Follow Us</h3>
                <div className="flex gap-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition hover:bg-blue-600 hover:text-white">
                    f
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition hover:bg-blue-600 hover:text-white">
                    𝕏
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 transition hover:bg-pink-600 hover:text-white">
                    📷
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 transition hover:bg-red-600 hover:text-white">
                    🎥
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Send us a Message</h2>

              {success && (
                <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-emerald-700">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                    placeholder="+977-98XXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="mt-1 w-full rounded-md border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                    placeholder="Your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Optional) */}
      <section className="bg-slate-50 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-3xl font-bold text-slate-900">Find Us On the Map</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.6538779866206!2d85.3240!3d27.7172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb199a06c2eaf5%3A0xc5db91aab1e7cfcc!2sKathmandu%2C%20Nepal!5e0!3m2!1sen!2snp!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mayaghar Location"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Contact
