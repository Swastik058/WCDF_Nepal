import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import ReceiptPreviewModal from '../../components/expenses/ReceiptPreviewModal';
import { expenseApi } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/adminFormat';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'hostel_maintenance', label: 'Hostel Maintenance' },
  { value: 'staff_salary', label: 'Staff Salary' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'sponsorship_usage', label: 'Sponsorship Usage' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'esewa', label: 'eSewa' },
  { value: 'khalti', label: 'Khalti' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

const PIE_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899',
];

const TABS = ['Expenses', 'Analytics'];

const INITIAL_FORM = {
  title: '', description: '', amount: '', category: 'other',
  expenseDate: '', paymentMethod: 'cash', beneficiaryChild: '',
  receiptNumber: '', vendorName: '', notes: '', isPublished: true,
};

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCategoryLabel = (val) => CATEGORIES.find((c) => c.value === val)?.label || val;
const getPaymentLabel = (val) => PAYMENT_METHODS.find((p) => p.value === val)?.label || val;

const categoryBadgeClass = (cat) => {
  const map = {
    food: 'bg-emerald-100 text-emerald-700',
    education: 'bg-blue-100 text-blue-700',
    medical: 'bg-red-100 text-red-700',
    utilities: 'bg-amber-100 text-amber-700',
    hostel_maintenance: 'bg-orange-100 text-orange-700',
    staff_salary: 'bg-purple-100 text-purple-700',
    emergency: 'bg-rose-100 text-rose-700',
    sponsorship_usage: 'bg-teal-100 text-teal-700',
    other: 'bg-slate-100 text-slate-600',
  };
  return map[cat] || 'bg-slate-100 text-slate-600';
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    teal: 'bg-teal-50 text-teal-700',
  };
  return (
    <div className={`rounded-xl p-4 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <span className="mb-1 block text-sm font-medium text-slate-700">
      {children}{required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
  );
}

function Input({ label, required, ...props }) {
  return (
    <label className="block">
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <input
        {...props}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
      />
    </label>
  );
}

function Select({ label, required, children, ...props }) {
  return (
    <label className="block">
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <select
        {...props}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
      >
        {children}
      </select>
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('Expenses');

  // ── Expense list state ──
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  // ── Filters ──
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // ── Children list (for beneficiary dropdown) ──
  const [children, setChildren] = useState([]);

  // ── Create/Edit form ──
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Receipt upload ──
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [uploadingReceipts, setUploadingReceipts] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const receiptInputRef = useRef(null);

  // ── Receipt preview modal ──
  const [previewExpense, setPreviewExpense] = useState(null);

  // ── Analytics ──
  const [analytics, setAnalytics] = useState(null);
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const isEditing = Boolean(editingId);

  // ── Derived years for filter ──
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYear - i), [currentYear]);

  // ── Load expenses ──
  const loadExpenses = useCallback(async (pg = 1) => {
    setLoading(true);
    setListError('');
    try {
      const data = await expenseApi.getAll({
        page: pg,
        limit: 15,
        search,
        category: filterCategory,
        year: filterYear,
        month: filterMonth,
      });
      setExpenses(data.expenses || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch (err) {
      setListError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterYear, filterMonth]);

  // ── Load children for beneficiary dropdown ──
  const loadChildren = useCallback(async () => {
    try {
      const data = await expenseApi.getChildren();
      setChildren(data || []);
    } catch {
      // non-critical
    }
  }, []);

  // ── Load analytics ──
  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await expenseApi.getAnalytics({ year: analyticsYear });
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsYear]);

  useEffect(() => { loadExpenses(1); }, [loadExpenses]);
  useEffect(() => { loadChildren(); }, [loadChildren]);
  useEffect(() => {
    if (activeTab === 'Analytics') loadAnalytics();
  }, [activeTab, loadAnalytics]);

  // ── Form handlers ──
  const openCreateForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setFormError('');
    setReceiptFiles([]);
    setUploadError('');
    setShowForm(true);
  };

  const openEditForm = (expense) => {
    setEditingId(expense._id);
    setForm({
      title: expense.title || '',
      description: expense.description || '',
      amount: expense.amount ?? '',
      category: expense.category || 'other',
      expenseDate: expense.expenseDate ? expense.expenseDate.slice(0, 10) : '',
      paymentMethod: expense.paymentMethod || 'cash',
      beneficiaryChild: expense.beneficiaryChild?._id || expense.beneficiaryChild || '',
      receiptNumber: expense.receiptNumber || '',
      vendorName: expense.vendorName || '',
      notes: expense.notes || '',
      isPublished: expense.isPublished !== false,
    });
    setFormError('');
    setReceiptFiles([]);
    setUploadError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setReceiptFiles([]);
    setFormError('');
    setUploadError('');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleReceiptFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setReceiptFiles(files);
    setUploadError('');
  };

  const validateForm = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.amount || Number(form.amount) <= 0) return 'Amount must be greater than 0';
    if (!form.expenseDate) return 'Expense date is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setFormError(err); return; }

    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        beneficiaryChild: form.beneficiaryChild || undefined,
      };

      let savedExpense;
      if (isEditing) {
        savedExpense = await expenseApi.update(editingId, payload);
      } else {
        savedExpense = await expenseApi.create(payload);
      }

      // Upload receipts if files were selected
      if (receiptFiles.length > 0) {
        setUploadingReceipts(true);
        setUploadError('');
        try {
          const formData = new FormData();
          receiptFiles.forEach((f) => formData.append('receipts', f));
          await expenseApi.uploadReceipts(savedExpense._id, formData);
        } catch (upErr) {
          setUploadError(`Expense saved but receipt upload failed: ${upErr.message}`);
        } finally {
          setUploadingReceipts(false);
        }
      }

      closeForm();
      await loadExpenses(isEditing ? page : 1);
    } catch (err) {
      setFormError(err.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this expense and all its receipts?')) return;
    try {
      await expenseApi.remove(id);
      await loadExpenses(expenses.length === 1 && page > 1 ? page - 1 : page);
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const handleDeleteReceipt = async (expenseId, receiptId, expenseName) => {
    if (!window.confirm(`Delete this receipt from "${expenseName}"?`)) return;
    try {
      const updated = await expenseApi.deleteReceipt(expenseId, receiptId);
      // Refresh the preview modal's data
      setPreviewExpense((prev) =>
        prev && prev._id === expenseId
          ? { ...prev, uploadedReceipts: updated.uploadedReceipts }
          : prev
      );
      // Refresh list
      setExpenses((prev) =>
        prev.map((e) =>
          e._id === expenseId ? { ...e, uploadedReceipts: updated.uploadedReceipts } : e
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to delete receipt');
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Expense Management"
        description="Track, verify, and publish all NGO expenses for full financial transparency"
        actions={
          <button
            onClick={openCreateForm}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700"
          >
            + Add Expense
          </button>
        }
      />

      {/* ── Tabs ── */}
      <div className="mb-5 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-5 py-1.5 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB: EXPENSES ══════════════ */}
      {activeTab === 'Expenses' && (
        <div className="space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <input
              type="text"
              placeholder="Search title, vendor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 w-48"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">All Years</option>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">All Months</option>
              {MONTHS.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <button
              onClick={() => { setSearch(''); setFilterCategory(''); setFilterYear(''); setFilterMonth(''); }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>

          {/* Summary */}
          {!loading && total > 0 && (
            <p className="text-sm text-slate-500">{total} expense{total !== 1 ? 's' : ''} found</p>
          )}

          {/* Table */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <TableState
              loading={loading}
              error={listError && expenses.length === 0 ? listError : ''}
              empty={!loading && expenses.length === 0}
              emptyText="No expenses found. Click '+ Add Expense' to get started."
            />

            {!loading && expenses.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Receipts</th>
                      <th className="px-4 py-3">Child</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate" title={exp.title}>
                          {exp.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryBadgeClass(exp.category)}`}>
                            {getCategoryLabel(exp.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {formatDate(exp.expenseDate)}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate" title={exp.vendorName}>
                          {exp.vendorName || <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {exp.uploadedReceipts?.length > 0 ? (
                            <button
                              onClick={() => setPreviewExpense(exp)}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {exp.uploadedReceipts.length} receipt{exp.uploadedReceipts.length !== 1 ? 's' : ''}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No receipt</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[110px] truncate">
                          {exp.beneficiaryChild
                            ? (exp.beneficiaryChild.fullName || exp.beneficiaryChild.name || '—')
                            : <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditForm(exp)}
                              className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(exp._id)}
                              className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <p className="text-sm text-slate-500">Page {page} of {pages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadExpenses(page - 1)}
                    disabled={page <= 1}
                    className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadExpenses(page + 1)}
                    disabled={page >= pages}
                    className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TAB: ANALYTICS ══════════════ */}
      {activeTab === 'Analytics' && (
        <div className="space-y-6">
          {/* Year selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Year:</label>
            <select
              value={analyticsYear}
              onChange={(e) => setAnalyticsYear(Number(e.target.value))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            >
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {analyticsLoading ? (
            <div className="py-12 text-center text-slate-400">Loading analytics…</div>
          ) : analytics ? (
            <>
              {/* Stat cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label={`Total (${analyticsYear})`}
                  value={formatCurrency(analytics.totalYear)}
                  sub={`${analytics.countYear} expenses`}
                  color="indigo"
                />
                <StatCard
                  label="All-Time Total"
                  value={formatCurrency(analytics.totalAllTime)}
                  sub={`${analytics.countAllTime} expenses`}
                  color="emerald"
                />
                <StatCard
                  label="Sponsorship Usage"
                  value={formatCurrency(analytics.sponsorshipTotal)}
                  sub={`${analytics.sponsorshipCount} expenses`}
                  color="teal"
                />
                <StatCard
                  label="Top Category"
                  value={analytics.byCategory[0] ? getCategoryLabel(analytics.byCategory[0].category) : '—'}
                  sub={analytics.byCategory[0] ? formatCurrency(analytics.byCategory[0].total) : ''}
                  color="amber"
                />
              </div>

              {/* Monthly bar chart */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Monthly Expenses — {analyticsYear}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Expenses']} />
                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category pie chart + table */}
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700">Category Breakdown</h3>
                  {analytics.byCategory.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No data for this year</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={analytics.byCategory}
                          dataKey="total"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {analytics.byCategory.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend iconSize={10} />
                        <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Category table */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700">Spending by Category ({analyticsYear})</h3>
                  {analytics.byCategory.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No data for this year</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {analytics.byCategory.map((c, i) => (
                        <div key={c.category} className="flex items-center justify-between py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                            />
                            <span className="text-sm text-slate-700">{c.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(c.total)}</p>
                            <p className="text-xs text-slate-400">{c.count} expense{c.count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent expenses */}
              {analytics.recentExpenses?.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700">Recent Expenses</h3>
                  <div className="divide-y divide-slate-100">
                    {analytics.recentExpenses.map((e) => (
                      <div key={e._id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{e.title}</p>
                          <p className="text-xs text-slate-400">
                            {getCategoryLabel(e.category)} · {formatDate(e.expenseDate)}
                            {e.vendorName ? ` · ${e.vendorName}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(e.amount)}</p>
                          {e.uploadedReceipts?.length > 0 && (
                            <p className="text-xs text-emerald-600">{e.uploadedReceipts.length} receipt{e.uploadedReceipts.length !== 1 ? 's' : ''}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">No analytics data available.</div>
          )}
        </div>
      )}

      {/* ══════════════ CREATE / EDIT MODAL ══════════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button onClick={closeForm} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
              {/* Row 1: Title */}
              <Input
                label="Expense Title"
                required
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. Monthly food supplies"
              />

              {/* Row 2: Amount + Date */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Amount (Rs.)"
                  required
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                />
                <Input
                  label="Expense Date"
                  required
                  name="expenseDate"
                  type="date"
                  value={form.expenseDate}
                  onChange={handleFormChange}
                />
              </div>

              {/* Row 3: Category + Payment Method */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Category" required name="category" value={form.category} onChange={handleFormChange}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
                <Select label="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange}>
                  {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </Select>
              </div>

              {/* Row 4: Vendor + Receipt Number */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Vendor / Supplier Name" name="vendorName" value={form.vendorName} onChange={handleFormChange} placeholder="Shop or service provider" />
                <Input label="Receipt / Invoice Number" name="receiptNumber" value={form.receiptNumber} onChange={handleFormChange} placeholder="INV-2024-001" />
              </div>

              {/* Row 5: Beneficiary Child */}
              <Select label="Beneficiary Child (optional)" name="beneficiaryChild" value={form.beneficiaryChild} onChange={handleFormChange}>
                <option value="">— None —</option>
                {children.map((c) => (
                  <option key={c._id} value={c._id}>{c.fullName || c.name}</option>
                ))}
              </Select>

              {/* Row 6: Description */}
              <label className="block">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="Brief description of the expense…"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
              </label>

              {/* Row 7: Notes */}
              <label className="block">
                <FieldLabel>Internal Notes</FieldLabel>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="Admin-only notes…"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
              </label>

              {/* Row 8: Receipt Upload */}
              <div>
                <FieldLabel>Upload Receipts / Invoices</FieldLabel>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-5 text-center hover:border-indigo-400 hover:bg-indigo-50 transition"
                  onClick={() => receiptInputRef.current?.click()}
                >
                  <svg className="mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-slate-600">Click to select receipts</p>
                  <p className="mt-0.5 text-xs text-slate-400">JPEG, PNG, WebP, PDF · max 10 MB each · up to 5 files</p>
                  <input
                    ref={receiptInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleReceiptFileChange}
                  />
                </div>
                {receiptFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {receiptFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700 font-medium">
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
                {uploadError && <p className="mt-1.5 text-xs text-amber-600">{uploadError}</p>}
              </div>

              {/* Published toggle */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={form.isPublished}
                  onChange={handleFormChange}
                  className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                />
                <span className="text-sm text-slate-700">Visible on public transparency dashboard</span>
              </label>

              {formError && (
                <div className="rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingReceipts}
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : uploadingReceipts ? 'Uploading receipts…' : isEditing ? 'Update Expense' : 'Create Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ RECEIPT PREVIEW MODAL ══════════════ */}
      {previewExpense && (
        <ReceiptPreviewModal
          expense={previewExpense}
          onClose={() => setPreviewExpense(null)}
          onDeleteReceipt={handleDeleteReceipt}
        />
      )}
    </div>
  );
}
