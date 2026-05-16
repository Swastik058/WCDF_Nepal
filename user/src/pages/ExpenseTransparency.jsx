import { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'food', label: 'Food' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'hostel_maintenance', label: 'Hostel Maintenance' },
  { value: 'staff_salary', label: 'Staff Salary' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'sponsorship_usage', label: 'Sponsorship Usage' },
  { value: 'other', label: 'Other' },
]

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const PIE_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCategoryLabel = (val) => {
  const c = CATEGORIES.find((c) => c.value === val)
  return c ? c.label : val
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(amount || 0)

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const categoryColor = (cat) => {
  const map = {
    food: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    education: 'bg-blue-100 text-blue-700 border-blue-200',
    medical: 'bg-red-100 text-red-700 border-red-200',
    utilities: 'bg-amber-100 text-amber-700 border-amber-200',
    hostel_maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
    staff_salary: 'bg-purple-100 text-purple-700 border-purple-200',
    emergency: 'bg-rose-100 text-rose-700 border-rose-200',
    sponsorship_usage: 'bg-teal-100 text-teal-700 border-teal-200',
    other: 'bg-slate-100 text-slate-600 border-slate-200',
  }
  return map[cat] || 'bg-slate-100 text-slate-600 border-slate-200'
}

// Cloudinary serves raw (PDF) files with Content-Disposition: attachment by default,
// which triggers an automatic download instead of inline preview.
// fl_attachment:false overrides this so the browser renders the PDF in the iframe.
const getInlinePdfUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  return url.replace('/upload/', '/upload/fl_attachment:false/');
};

// ─── Receipt Modal ────────────────────────────────────────────────────────────

function PublicReceiptModal({ expense, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const receipts = expense?.uploadedReceipts || []
  const active = receipts[activeIdx]
  const isImage = active?.fileType === 'image' || active?.mimeType?.startsWith('image/')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900">{expense.title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {receipts.length} official receipt{receipts.length !== 1 ? 's' : ''} · {formatCurrency(expense.amount)} · {formatDate(expense.expenseDate)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {receipts.length === 0 ? (
          <p className="py-12 text-center text-slate-400">No receipts attached.</p>
        ) : (
          <>
            <div className="flex flex-1 overflow-hidden">
              {/* Thumbnail sidebar */}
              {receipts.length > 1 && (
                <div className="flex w-28 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-slate-200 bg-slate-50 p-2">
                  {receipts.map((r, i) => {
                    const img = r.fileType === 'image' || r.mimeType?.startsWith('image/')
                    return (
                      <button
                        key={r._id || i}
                        onClick={() => setActiveIdx(i)}
                        className={`rounded-md border-2 overflow-hidden ${activeIdx === i ? 'border-emerald-500' : 'border-transparent hover:border-slate-300'}`}
                      >
                        {img ? (
                          <img src={r.url} alt="" className="h-18 w-full object-cover" />
                        ) : (
                          <div className="flex h-14 items-center justify-center bg-slate-200 text-slate-400 text-xs">PDF</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
              {/* Main viewer */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
                  {isImage ? (
                    <img src={active?.url} alt="Receipt" className="max-h-[380px] max-w-full rounded-lg object-contain shadow" />
                  ) : (
                    <div className="flex h-full w-full flex-col" style={{ minHeight: 380 }}>
                      <iframe
                        src={getInlinePdfUrl(active?.url)}
                        title="Receipt PDF"
                        className="flex-1 w-full border-0"
                        style={{ minHeight: 360 }}
                      />
                      <p className="py-1 text-center text-xs text-slate-400">
                        PDF not displaying?{' '}
                        <a href={active?.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
                          Open in new tab
                        </a>
                      </p>
                    </div>
                  )}
                </div>
                {/* File info */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5 shrink-0">
                  <p className="text-xs text-slate-500 truncate max-w-xs">{active?.originalName || `Receipt ${activeIdx + 1}`}</p>
                  <a
                    href={active?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    ↓ Download
                  </a>
                </div>
              </div>
            </div>
            {receipts.length > 1 && (
              <div className="flex items-center justify-center gap-4 border-t border-slate-100 bg-white py-2.5 shrink-0">
                <button onClick={() => setActiveIdx((i) => Math.max(0, i - 1))} disabled={activeIdx === 0}
                  className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                <span className="text-xs text-slate-500">{activeIdx + 1} / {receipts.length}</span>
                <button onClick={() => setActiveIdx((i) => Math.min(receipts.length - 1, i + 1))} disabled={activeIdx === receipts.length - 1}
                  className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-50">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Expense Detail Modal ─────────────────────────────────────────────────────

function ExpenseDetailModal({ expense, onClose, onViewReceipts }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">{expense.title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="divide-y divide-slate-100 px-5 py-4 text-sm">
          <Row label="Amount" value={formatCurrency(expense.amount)} bold />
          <Row label="Category" value={getCategoryLabel(expense.category)} />
          <Row label="Date" value={formatDate(expense.expenseDate)} />
          {expense.vendorName && <Row label="Vendor" value={expense.vendorName} />}
          {expense.receiptNumber && <Row label="Receipt No." value={expense.receiptNumber} />}
          {expense.paymentMethod && <Row label="Payment" value={expense.paymentMethod?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />}
          {expense.description && (
            <div className="py-2.5">
              <p className="font-medium text-slate-500">Description</p>
              <p className="mt-1 text-slate-700">{expense.description}</p>
            </div>
          )}
          {expense.beneficiaryChild && (
            <div className="py-2.5">
              <p className="font-medium text-slate-500">Beneficiary Child</p>
              <div className="mt-1.5 flex items-center gap-2">
                {(expense.beneficiaryChild.image || expense.beneficiaryChild.profileImage) && (
                  <img
                    src={expense.beneficiaryChild.image || expense.beneficiaryChild.profileImage}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover border border-slate-200"
                  />
                )}
                <p className="text-slate-700 font-medium">
                  {expense.beneficiaryChild.fullName || expense.beneficiaryChild.name}
                  {expense.beneficiaryChild.age ? `, age ${expense.beneficiaryChild.age}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50">
          {expense.uploadedReceipts?.length > 0 ? (
            <button
              onClick={() => { onClose(); onViewReceipts(expense) }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View {expense.uploadedReceipts.length} Receipt{expense.uploadedReceipts.length !== 1 ? 's' : ''}
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">No receipts attached</span>
          )}
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 font-medium text-slate-500">{label}</span>
      <span className={`text-right ${bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{value}</span>
    </div>
  )
}

// ─── Analytics Bar ────────────────────────────────────────────────────────────

function CategoryBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-sm text-slate-600 truncate" title={label}>{label}</span>
      <div className="relative flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-20 shrink-0 text-right text-sm font-semibold text-slate-700">{formatCurrency(value)}</span>
      <span className="w-10 shrink-0 text-right text-xs text-slate-400">{pct}%</span>
    </div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ExpenseTransparency() {
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [sponsorshipOnly, setSponsorshipOnly] = useState(false)

  const [detailExpense, setDetailExpense] = useState(null)
  const [receiptExpense, setReceiptExpense] = useState(null)

  const [activeSection, setActiveSection] = useState('expenses') // 'expenses' | 'analytics'
  const searchTimeout = useRef(null)

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const fetchExpenses = useCallback(async (pg = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.append('page', pg)
      params.append('limit', 12)
      if (search.trim()) params.append('search', search.trim())
      if (filterCategory) params.append('category', filterCategory)
      if (filterYear) params.append('year', filterYear)
      if (filterMonth) params.append('month', filterMonth)
      if (sponsorshipOnly) params.append('sponsorship', 'true')

      const res = await axios.get(`${API_URL}/expenses/public?${params}`)
      setExpenses(res.data.expenses || [])
      setTotal(res.data.total || 0)
      setPages(res.data.pages || 1)
      setPage(pg)
    } catch {
      setError('Failed to load expenses. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [search, filterCategory, filterYear, filterMonth, sponsorshipOnly])

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const res = await axios.get(`${API_URL}/expenses/public/analytics`)
      setAnalytics(res.data)
    } catch {
      setAnalytics(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchExpenses(1), 350)
    return () => clearTimeout(searchTimeout.current)
  }, [fetchExpenses])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  const clearFilters = () => {
    setSearch('')
    setFilterCategory('')
    setFilterYear('')
    setFilterMonth('')
    setSponsorshipOnly(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 py-14 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-200">100% Transparent</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Financial Transparency Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-base text-emerald-100">
            Every rupee donated to WCDF-Nepal is tracked and publicly accountable. Browse all our expenses, view official receipts, and see exactly how your contributions are used.
          </p>
          {/* Quick stats from analytics */}
          {analytics && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Expenses', value: formatCurrency(analytics.totalAmount) },
                { label: 'Expense Count', value: `${analytics.totalCount}` },
                { label: 'Sponsorship Used', value: formatCurrency(analytics.sponsorshipTotal) },
                { label: 'Categories', value: `${analytics.byCategory.length}` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-xs text-emerald-200">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section Tabs ── */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="mx-auto flex max-w-5xl gap-1 px-4 sm:px-6">
          {[
            { id: 'expenses', label: 'All Expenses' },
            { id: 'analytics', label: 'Analytics & Charts' },
            { id: 'sponsorship', label: 'Sponsorship Tracking' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                activeSection === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ══════════ SECTION: ALL EXPENSES ══════════ */}
        {activeSection === 'expenses' && (
          <div className="space-y-5">
            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search expenses…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 w-52"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setSponsorshipOnly(false) }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                >
                  <option value="">All Years</option>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                >
                  <option value="">All Months</option>
                  {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition">
                  <input
                    type="checkbox"
                    checked={sponsorshipOnly}
                    onChange={(e) => { setSponsorshipOnly(e.target.checked); if (e.target.checked) setFilterCategory('') }}
                    className="rounded accent-teal-600"
                  />
                  Sponsorship only
                </label>
                <button
                  onClick={clearFilters}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
              {!loading && (
                <p className="mt-2 text-xs text-slate-400">{total} expense{total !== 1 ? 's' : ''} found</p>
              )}
            </div>

            {/* Error */}
            {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-44 animate-pulse rounded-xl bg-slate-200" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && expenses.length === 0 && !error && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-base font-medium text-slate-600">No expenses found</p>
                <p className="mt-1 text-sm text-slate-400">Try adjusting your filters</p>
              </div>
            )}

            {/* Expense cards */}
            {!loading && expenses.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition"
                    onClick={() => setDetailExpense(exp)}
                  >
                    {/* Category + receipt badge */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColor(exp.category)}`}>
                        {getCategoryLabel(exp.category)}
                      </span>
                      {exp.uploadedReceipts?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified ({exp.uploadedReceipts.length})
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">No receipt</span>
                      )}
                    </div>

                    {/* Title + amount */}
                    <h3 className="mb-1 font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition">{exp.title}</h3>
                    <p className="text-xl font-extrabold text-emerald-700">{formatCurrency(exp.amount)}</p>

                    {/* Meta */}
                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p>📅 {formatDate(exp.expenseDate)}</p>
                      {exp.vendorName && <p>🏪 {exp.vendorName}</p>}
                      {exp.beneficiaryChild && (
                        <p className="text-teal-600 font-medium">
                          👶 {exp.beneficiaryChild.fullName || exp.beneficiaryChild.name}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDetailExpense(exp) }}
                        className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        View Details
                      </button>
                      {exp.uploadedReceipts?.length > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setReceiptExpense(exp) }}
                          className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          See Receipt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => fetchExpenses(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40 hover:bg-white"
                >
                  ← Previous
                </button>
                <span className="text-sm text-slate-500">Page {page} of {pages}</span>
                <button
                  onClick={() => fetchExpenses(page + 1)}
                  disabled={page >= pages}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40 hover:bg-white"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════ SECTION: ANALYTICS ══════════ */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="py-16 text-center text-slate-400">Loading analytics…</div>
            ) : analytics ? (
              <>
                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Total Amount Spent', value: formatCurrency(analytics.totalAmount), note: `${analytics.totalCount} expenses`, color: 'border-l-emerald-500' },
                    { label: 'Sponsorship Usage', value: formatCurrency(analytics.sponsorshipTotal), note: 'Funds used for sponsored children', color: 'border-l-teal-500' },
                    { label: 'Categories Tracked', value: analytics.byCategory.length, note: 'Different expense types', color: 'border-l-indigo-500' },
                  ].map((card) => (
                    <div key={card.label} className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 ${card.color}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                      <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{card.value}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{card.note}</p>
                    </div>
                  ))}
                </div>

                {/* Monthly trend */}
                {analytics.monthly?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 font-semibold text-slate-800">Monthly Expense Trend (Last 12 Months)</h3>
                    <div className="space-y-3">
                      {(() => {
                        const maxVal = Math.max(...analytics.monthly.map((m) => m.total), 1)
                        return analytics.monthly.slice(-12).map((m) => (
                          <div key={m.label} className="flex items-center gap-3">
                            <span className="w-20 shrink-0 text-xs text-slate-500">{m.label}</span>
                            <div className="relative flex-1 h-3.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${(m.total / maxVal) * 100}%` }}
                              />
                            </div>
                            <span className="w-24 shrink-0 text-right text-xs font-semibold text-slate-700">{formatCurrency(m.total)}</span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                )}

                {/* Category breakdown */}
                {analytics.byCategory?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 font-semibold text-slate-800">Spending by Category</h3>
                    <div className="space-y-3">
                      {analytics.byCategory.map((c, i) => (
                        <CategoryBar
                          key={c.category}
                          label={c.label}
                          value={c.total}
                          total={analytics.totalAmount}
                          color={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent expenses */}
                {analytics.recentExpenses?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-semibold text-slate-800">Most Recent Expenses</h3>
                    <div className="divide-y divide-slate-100">
                      {analytics.recentExpenses.map((e) => (
                        <div key={e._id} className="flex items-center justify-between gap-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800">{e.title}</p>
                            <p className="text-xs text-slate-400">{getCategoryLabel(e.category)} · {formatDate(e.expenseDate)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-emerald-700">{formatCurrency(e.amount)}</p>
                            {e.uploadedReceipts?.length > 0 && (
                              <p className="text-xs text-emerald-500">{e.uploadedReceipts.length} receipt{e.uploadedReceipts.length !== 1 ? 's' : ''}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="py-16 text-center text-slate-400">Analytics not available</p>
            )}
          </div>
        )}

        {/* ══════════ SECTION: SPONSORSHIP TRACKING ══════════ */}
        {activeSection === 'sponsorship' && (
          <div className="space-y-5">
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💚</span>
                <div>
                  <h3 className="font-bold text-teal-800">Child Sponsorship Transparency</h3>
                  <p className="mt-1 text-sm text-teal-700">
                    When you sponsor a child, 100% of your funds go directly to their needs. Below you can see exactly how sponsorship money has been used — from school fees and books to food and medical care.
                  </p>
                </div>
              </div>
            </div>

            <SponsorshipExpenses onViewReceipts={(exp) => setReceiptExpense(exp)} />
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {detailExpense && (
        <ExpenseDetailModal
          expense={detailExpense}
          onClose={() => setDetailExpense(null)}
          onViewReceipts={(exp) => setReceiptExpense(exp)}
        />
      )}
      {receiptExpense && (
        <PublicReceiptModal
          expense={receiptExpense}
          onClose={() => setReceiptExpense(null)}
        />
      )}

      <Footer />
    </div>
  )
}

// ─── Sponsorship Expenses sub-component ──────────────────────────────────────

function SponsorshipExpenses({ onViewReceipts }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    axios.get(`${API_URL}/expenses/public?category=sponsorship_usage&limit=50`)
      .then((res) => {
        setItems(res.data.expenses || [])
        setTotal((res.data.expenses || []).reduce((s, e) => s + e.amount, 0))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-12 text-center text-slate-400">Loading sponsorship expenses…</div>

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">No sponsorship expenses recorded yet.</p>
      </div>
    )
  }

  // Group by beneficiary child
  const byChild = {}
  const unlinked = []
  items.forEach((exp) => {
    if (exp.beneficiaryChild?._id) {
      const id = exp.beneficiaryChild._id
      if (!byChild[id]) byChild[id] = { child: exp.beneficiaryChild, expenses: [], total: 0 }
      byChild[id].expenses.push(exp)
      byChild[id].total += exp.amount
    } else {
      unlinked.push(exp)
    }
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{items.length} sponsorship expense{items.length !== 1 ? 's' : ''}</p>
        <p className="text-sm font-bold text-teal-700">Total: {formatCurrency(total)}</p>
      </div>

      {/* Grouped by child */}
      {Object.values(byChild).map(({ child, expenses, total: childTotal }) => (
        <div key={child._id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Child header */}
          <div className="flex items-center gap-4 bg-teal-50 px-5 py-3 border-b border-teal-100">
            {(child.image || child.profileImage) ? (
              <img src={child.image || child.profileImage} alt="" className="h-10 w-10 rounded-full object-cover border-2 border-teal-200" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-200 text-teal-700 font-bold">
                {(child.fullName || child.name || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-teal-800">{child.fullName || child.name}</p>
              {child.age && <p className="text-xs text-teal-600">Age {child.age}</p>}
            </div>
            <p className="text-right font-extrabold text-teal-700">{formatCurrency(childTotal)}</p>
          </div>
          {/* Expense rows */}
          <div className="divide-y divide-slate-100">
            {expenses.map((exp) => (
              <div key={exp._id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{exp.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(exp.expenseDate)}{exp.vendorName ? ` · ${exp.vendorName}` : ''}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-bold text-slate-800">{formatCurrency(exp.amount)}</p>
                  {exp.uploadedReceipts?.length > 0 && (
                    <button
                      onClick={() => onViewReceipts(exp)}
                      className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Unlinked sponsorship expenses */}
      {unlinked.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <p className="font-semibold text-slate-700">General Sponsorship Expenses</p>
          </div>
          <div className="divide-y divide-slate-100">
            {unlinked.map((exp) => (
              <div key={exp._id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{exp.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(exp.expenseDate)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-bold text-slate-800">{formatCurrency(exp.amount)}</p>
                  {exp.uploadedReceipts?.length > 0 && (
                    <button onClick={() => onViewReceipts(exp)}
                      className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
