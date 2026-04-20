import { useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/admin/FormInput';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatDate } from '../../utils/adminFormat';

const initialForm = {
  name: '',
  dateOfBirth: '',
  gender: 'other',
  image: '',
  description: '',
  yearlyCost: '',
  education: '',
  food: '',
  healthcare: '',
  shelter: '',
  others: '',
  joinedYear: '',
  guardianName: '',
  contactNumber: '',
  address: '',
  healthNotes: '',
  educationLevel: '',
  isPublished: false,
  isActive: true,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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
        image: reader.result || '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Child name is required';
    if (!form.dateOfBirth) return 'Date of birth is required';
    if (Number(form.yearlyCost || 0) < 0) return 'Yearly cost cannot be negative';
    return '';
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    fullName: form.name.trim(),
    dateOfBirth: form.dateOfBirth,
    gender: form.gender,
    image: form.image,
    profileImage: form.image,
    description: form.description.trim(),
    shortBio: form.description.trim(),
    yearlyCost: Number(form.yearlyCost || 0),
    costBreakdown: {
      education: Number(form.education || 0),
      food: Number(form.food || 0),
      healthcare: Number(form.healthcare || 0),
      shelter: Number(form.shelter || 0),
      others: Number(form.others || 0),
    },
    joinedYear: form.joinedYear ? Number(form.joinedYear) : null,
    guardianName: form.guardianName.trim(),
    contactNumber: form.contactNumber.trim(),
    address: form.address.trim(),
    healthNotes: form.healthNotes.trim(),
    educationLevel: form.educationLevel.trim(),
    isPublished: form.isPublished,
    isActive: form.isActive,
  });

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
      const payload = buildPayload();
      if (isEditing) {
        await adminApi.updateChild(editingId, payload);
      } else {
        await adminApi.createChild(payload);
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
      name: item.name || item.fullName || '',
      dateOfBirth: item.dateOfBirth ? item.dateOfBirth.slice(0, 10) : '',
      gender: item.gender || 'other',
      image: item.image || item.profileImage || '',
      description: item.description || item.shortBio || '',
      yearlyCost: item.yearlyCost || '',
      education: item.costBreakdown?.education || '',
      food: item.costBreakdown?.food || '',
      healthcare: item.costBreakdown?.healthcare || '',
      shelter: item.costBreakdown?.shelter || '',
      others: item.costBreakdown?.others || '',
      joinedYear: item.joinedYear || '',
      guardianName: item.guardianName || '',
      contactNumber: item.contactNumber || '',
      address: item.address || '',
      healthNotes: item.healthNotes || '',
      educationLevel: item.educationLevel || '',
      isPublished: Boolean(item.isPublished),
      isActive: Boolean(item.isActive),
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
      <PageHeader title="Children Profile" description="Create, update and manage child sponsorship profiles" />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Child' : 'Add Child'}</h2>

          <FormInput label="Child Name" name="name" value={form.name} onChange={handleChange} required />
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

          {form.image ? (
            <div className="mt-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Image Preview</span>
              <img
                src={form.image}
                alt="Child preview"
                className="h-28 w-full max-w-xs rounded-md border border-slate-200 object-cover"
              />
            </div>
          ) : null}

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Public-safe child profile description"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </label>

          <FormInput
            label="Yearly Sponsorship Cost"
            name="yearlyCost"
            value={form.yearlyCost}
            onChange={handleChange}
            type="number"
            min="0"
            placeholder="50000"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <FormInput label="Education" name="education" value={form.education} onChange={handleChange} type="number" min="0" />
            <FormInput label="Food" name="food" value={form.food} onChange={handleChange} type="number" min="0" />
            <FormInput label="Healthcare" name="healthcare" value={form.healthcare} onChange={handleChange} type="number" min="0" />
            <FormInput label="Shelter" name="shelter" value={form.shelter} onChange={handleChange} type="number" min="0" />
            <FormInput label="Others" name="others" value={form.others} onChange={handleChange} type="number" min="0" />
            <FormInput label="Joined Year" name="joinedYear" value={form.joinedYear} onChange={handleChange} type="number" placeholder="2024" />
          </div>

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
                      <th className="py-2">Yearly Cost</th>
                      <th className="py-2">Sponsored</th>
                      <th className="py-2">Sponsor</th>
                      <th className="py-2">Updated</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((item) => (
                      <tr key={item._id} className="border-t border-slate-100">
                        <td className="py-2 font-medium text-slate-900">{item.name || item.fullName}</td>
                        <td className="py-2">{formatCurrency(item.yearlyCost)}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isSponsored ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {item.isSponsored ? 'Sponsored' : 'Available'}
                          </span>
                        </td>
                        <td className="py-2">{item.sponsoredBy?.name || item.sponsoredBy?.email || '-'}</td>
                        <td className="py-2">{formatDate(item.updatedAt)}</td>
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
