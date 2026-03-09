import { useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/admin/FormInput';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/adminFormat';

const initialForm = {
  title: '',
  description: '',
  eventDate: '',
  location: '',
  eventType: 'other',
  expectedParticipants: 0,
  budget: 0,
  status: 'planned',
};

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.eventDate) return 'Event date is required';
    return '';
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
      if (isEditing) {
        await adminApi.updateEvent(editingId, form);
      } else {
        await adminApi.createEvent(form);
      }
      resetForm();
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      ...initialForm,
      ...item,
      eventDate: item.eventDate ? item.eventDate.slice(0, 10) : '',
    });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    setError('');
    try {
      await adminApi.deleteEvent(id);
      await loadEvents();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  };

  return (
    <div>
      <PageHeader title="Events Management" description="Create and maintain event records" />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Event' : 'Add Event'}</h2>

          <FormInput label="Title" name="title" value={form.title} onChange={handleChange} required />
          <FormInput label="Event Date" name="eventDate" type="date" value={form.eventDate} onChange={handleChange} required />
          <FormInput label="Location" name="location" value={form.location} onChange={handleChange} />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Event Type</span>
            <select name="eventType" value={form.eventType} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option value="fundraiser">Fundraiser</option>
              <option value="awareness">Awareness</option>
              <option value="community">Community</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
          </label>

          <FormInput label="Expected Participants" name="expectedParticipants" type="number" min="0" value={form.expectedParticipants} onChange={handleChange} />
          <FormInput label="Budget" name="budget" type="number" min="0" step="0.01" value={form.budget} onChange={handleChange} />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Status</span>
            <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option value="planned">Planned</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

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
          <h2 className="text-lg font-semibold text-slate-900">Events List</h2>
          <div className="mt-3">
            <TableState loading={loading} error={error && events.length === 0 ? error : ''} empty={!loading && events.length === 0} emptyText="No events found." />

            {!loading && events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Title</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Budget</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((item) => (
                      <tr key={item._id} className="border-t border-slate-100">
                        <td className="py-2">{item.title}</td>
                        <td className="py-2">{formatDate(item.eventDate)}</td>
                        <td className="py-2">{item.status}</td>
                        <td className="py-2">{formatCurrency(item.budget)}</td>
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

export default EventsPage;
