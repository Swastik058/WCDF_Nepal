import { useCallback, useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/admin/FormInput';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';

const initialForm = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  image: '',
  // icon: '',
  isActive: true,
  displayOrder: 0,
};

function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await adminApi.getPrograms();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.shortDescription.trim()) return 'Short description is required';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        ...form,
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (isEditing) {
        await adminApi.updateProgram(editingId, payload);
        setSuccessMessage('Program updated successfully.');
      } else {
        await adminApi.createProgram(payload);
        setSuccessMessage('Program created successfully.');
      }

      resetForm();
      await loadPrograms();
    } catch (err) {
      setError(err.message || 'Failed to save program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (program) => {
    setEditingId(program._id);
    setForm({
      title: program.title || '',
      shortDescription: program.shortDescription || '',
      fullDescription: program.fullDescription || '',
      image: program.image || '',
      // icon: program.icon || '',
      isActive: Boolean(program.isActive),
      displayOrder: program.displayOrder || 0,
    });
    setError('');
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this program?')) return;

    setError('');
    setSuccessMessage('');

    try {
      await adminApi.deleteProgram(id);
      if (editingId === id) {
        resetForm();
      }
      setSuccessMessage('Program deleted successfully.');
      await loadPrograms();
    } catch (err) {
      setError(err.message || 'Failed to delete program');
    }
  };

  return (
    <div>
      <PageHeader
        title="Programs Management"
        description="Create, update, reorder, activate, and remove programs shown on the public website."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Program' : 'Add Program'}
          </h2>

          <FormInput label="Title" name="title" value={form.title} onChange={handleChange} required />
          <FormInput
            label="Display Order"
            name="displayOrder"
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={handleChange}
          />
          <FormInput
            label="Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/program.jpg"
          />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Short Description</span>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Full Description</span>
            <textarea
              name="fullDescription"
              value={form.fullDescription}
              onChange={handleChange}
              rows={6}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </label>

          <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Show this program publicly
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Programs List</h2>
          <div className="mt-3">
            <TableState
              loading={loading}
              error={error && programs.length === 0 ? error : ''}
              empty={!loading && programs.length === 0}
              emptyText="No programs found."
            />

            {!loading && programs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Title</th>
                      <th className="py-2">Order</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((program) => (
                      <tr key={program._id} className="border-t border-slate-100">
                        <td className="py-2">
                          <div>
                            <p className="font-medium text-slate-900">{program.title}</p>
                            <p className="text-xs text-slate-500">{program.shortDescription}</p>
                          </div>
                        </td>
                        <td className="py-2 text-slate-600">{program.displayOrder}</td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              program.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {program.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(program)}
                              className="text-indigo-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(program._id)}
                              className="text-rose-600 hover:underline"
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgramsPage;
