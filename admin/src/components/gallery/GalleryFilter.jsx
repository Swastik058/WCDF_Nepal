function GalleryFilter({ label = 'Filter by category', value, onChange, categories, includeAll = true }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500">
        {includeAll ? <option value="">All categories</option> : <option value="">Select category</option>}
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default GalleryFilter;
