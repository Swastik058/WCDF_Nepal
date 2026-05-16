function GalleryFilter({ categories, activeCategoryId, onSelectCategory }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-8">
      <button
        type="button"
        onClick={() => onSelectCategory('')}
        className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
          !activeCategoryId
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900'
        }`}
      >
        All categories
      </button>

      {categories.map((category) => {
        const isActive = category._id === activeCategoryId;

        return (
          <button
            key={category._id}
            type="button"
            onClick={() => onSelectCategory(category._id)}
            className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
              isActive
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

export default GalleryFilter;
