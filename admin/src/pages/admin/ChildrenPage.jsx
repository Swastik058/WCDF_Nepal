import { useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/admin/FormInput';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatDate } from '../../utils/adminFormat';

const initialForm = {
  fullName: '',
  dateOfBirth: '',
  gender: 'other',
  profileImage: '',
  shortBio: '',
  joinedYear: '',
  guardianName: '',
  contactNumber: '',
  address: '',
  healthNotes: '',
  educationLevel: '',
  isPublished: false,
  isActive: true,
};

function ChildrenPage() {
  const [children, setChildren] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadChildren = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getChildren();
      setChildren(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch children');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        profileImage: reader.result || '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!form.dateOfBirth) return 'Date of birth is required';
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
        await adminApi.updateChild(editingId, form);
      } else {
        await adminApi.createChild(form);
      }
      resetForm();
      await loadChildren();
    } catch (err) {
      setError(err.message || 'Failed to save child');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      ...initialForm,
      ...item,
      dateOfBirth: item.dateOfBirth ? item.dateOfBirth.slice(0, 10) : '',
    });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this child record?')) return;
    setError('');
    try {
      await adminApi.deleteChild(id);
      await loadChildren();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || 'Failed to delete child');
    }
  };

  return (
    <div>
      <PageHeader title="Children Profile" description="Create, update and manage child records" />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Child' : 'Add Child'}</h2>

          <FormInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
          <FormInput label="Date Of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Gender</span>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Upload Profile Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none file:cursor-pointer file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm"
            />
          </label>

          {form.profileImage ? (
            <div className="mt-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Image Preview</span>
              <img
                src={form.profileImage}
                alt="Child preview"
                className="h-28 w-full max-w-xs rounded-md object-cover border border-slate-200"
              />
            </div>
          ) : null}

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Short Bio</span>
            <textarea
              name="shortBio"
              value={form.shortBio}
              onChange={handleChange}
              rows={3}
              placeholder="A short description for the child"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </label>
          <FormInput
            label="Joined Year"
            name="joinedYear"
            value={form.joinedYear}
            onChange={handleChange}
            type="number"
            placeholder="2024"
          />

          <FormInput label="Guardian Name" name="guardianName" value={form.guardianName} onChange={handleChange} />
          <FormInput label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} />
          <FormInput label="Address" name="address" value={form.address} onChange={handleChange} />
          <FormInput label="Education Level" name="educationLevel" value={form.educationLevel} onChange={handleChange} />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Health Notes</span>
            <textarea
              name="healthNotes"
              value={form.healthNotes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
            Publish publicly
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
              <button type="button" onClick={resetForm} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                Cancel
              </button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Children List</h2>
          <div className="mt-3">
            <TableState loading={loading} error={error && children.length === 0 ? error : ''} empty={!loading && children.length === 0} emptyText="No child records found." />

            {!loading && children.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Name</th>
                      <th className="py-2">DOB</th>
                      <th className="py-2">Guardian</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((item) => (
                      <tr key={item._id} className="border-t border-slate-100">
                        <td className="py-2">{item.fullName}</td>
                        <td className="py-2">{formatDate(item.dateOfBirth)}</td>
                        <td className="py-2">{item.guardianName || '-'}</td>
                        <td className="py-2">{item.isActive ? 'Active' : 'Inactive'}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleEdit(item)} className="text-indigo-600 hover:underline">
                              Edit
                            </button>
                            <button type="button" onClick={() => handleDelete(item._id)} className="text-rose-600 hover:underline">
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

export default ChildrenPage;
