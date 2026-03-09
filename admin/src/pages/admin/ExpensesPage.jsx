import { useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/admin/FormInput';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/adminFormat';

const initialForm = {
  title: '',
  category: 'other',
  amount: '',
  expenseDate: '',
  paymentMethod: 'cash',
  description: '',
  receiptNumber: '',
};

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.amount || Number(form.amount) <= 0) return 'Amount must be greater than 0';
    if (!form.expenseDate) return 'Expense date is required';
    return '';
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (isEditing) {
        await adminApi.updateExpense(editingId, payload);
      } else {
        await adminApi.createExpense(payload);
      }
      resetForm();
      await loadExpenses();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      ...initialForm,
      ...item,
      amount: item.amount ?? '',
      expenseDate: item.expenseDate ? item.expenseDate.slice(0, 10) : '',
    });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setError('');
    try {
      await adminApi.deleteExpense(id);
      await loadExpenses();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  return (
    <div>
      <PageHeader title="Expenses Management" description="Track and maintain all expenses" />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>

          <FormInput label="Title" name="title" value={form.title} onChange={handleChange} required />
          <FormInput label="Amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
          <FormInput label="Expense Date" name="expenseDate" type="date" value={form.expenseDate} onChange={handleChange} required />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Category</span>
            <select name="category" value={form.category} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option value="food">Food</option>
              <option value="medical">Medical</option>
              <option value="education">Education</option>
              <option value="utility">Utility</option>
              <option value="event">Event</option>
              <option value="salary">Salary</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Payment Method</span>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
              <option value="other">Other</option>
            </select>
          </label>

          <FormInput label="Receipt Number" name="receiptNumber" value={form.receiptNumber} onChange={handleChange} />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70">
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
            {isEditing ? <button type="button" onClick={resetForm} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Cancel</button> : null}
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Expenses List</h2>
          <div className="mt-3">
            <TableState loading={loading} error={error && expenses.length === 0 ? error : ''} empty={!loading && expenses.length === 0} emptyText="No expenses found." />

            {!loading && expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Title</th>
                      <th className="py-2">Category</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((item) => (
                      <tr key={item._id} className="border-t border-slate-100">
                        <td className="py-2">{item.title}</td>
                        <td className="py-2">{item.category}</td>
                        <td className="py-2">{formatCurrency(item.amount)}</td>
                        <td className="py-2">{formatDate(item.expenseDate)}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleEdit(item)} className="text-indigo-600 hover:underline">Edit</button>
                            <button type="button" onClick={() => handleDelete(item._id)} className="text-rose-600 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpensesPage;
