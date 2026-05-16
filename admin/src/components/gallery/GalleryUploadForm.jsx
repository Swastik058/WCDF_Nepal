import { useEffect, useState } from 'react';

function GalleryUploadForm({
  categories,
  form,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  selectedFiles,
  submitting,
  error,
  successMessage,
}) {
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const urls = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [selectedFiles]);

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Upload Gallery Photos</h2>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Category</span>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={onChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Select active category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Optional Title</span>
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          placeholder="Optional title for all uploaded images"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Optional Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Images</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onFileChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none file:cursor-pointer file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm"
        />
        <span className="mt-1 block text-xs text-slate-500">
          Each file becomes a separate gallery image record under the selected category.
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={onChange} />
        Publish uploaded images immediately
      </label>

      {previewUrls.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Preview</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {previewUrls.map((item) => (
              <div key={item.url} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                <img src={item.url} alt={item.name} className="h-32 w-full object-cover" />
                <p className="truncate px-2 py-1 text-xs text-slate-600">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70">
          {submitting ? 'Uploading...' : 'Upload Images'}
        </button>
        {selectedFiles.length > 0 ? (
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
            Clear
          </button>
        ) : null}
      </div>

      {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}

export default GalleryUploadForm;
