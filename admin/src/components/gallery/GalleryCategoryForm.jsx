import FormInput from '../admin/FormInput';

function GalleryCategoryForm({ form, onChange, onSubmit, onCancel, isEditing, submitting, error, successMessage }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Category' : 'Create Category'}</h2>

      <FormInput label="Category Name" name="name" value={form.name} onChange={onChange} required placeholder="Festivals, Events, Donations" />

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Short Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} />
        Active category
      </label>

      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70">
          {submitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
        </button>
        {isEditing ? (
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
            Cancel
          </button>
        ) : null}
      </div>

      {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}

export default GalleryCategoryForm;
