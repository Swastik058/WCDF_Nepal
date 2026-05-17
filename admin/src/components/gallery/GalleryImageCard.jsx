function GalleryImageCard({ image, onEdit, onTogglePublish, onDelete }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <img src={image.imageUrl} alt={image.title || image.category?.name || 'Gallery image'} className="h-40 w-full object-cover" />
      <div className="space-y-2 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="flex-1 truncate text-sm font-semibold text-slate-900">{image.title || 'Untitled'}</p>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${image.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {image.isPublished ? 'Live' : 'Draft'}
          </span>
        </div>

        <p className="text-xs text-slate-500">{image.category?.name || 'Uncategorized'}</p>

        <div className="flex gap-3 text-xs">
          <button type="button" onClick={() => onEdit(image)} className="text-indigo-600 hover:underline">
            Edit
          </button>
          <button type="button" onClick={() => onTogglePublish(image._id)} className="text-emerald-600 hover:underline">
            {image.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button type="button" onClick={() => onDelete(image._id)} className="text-rose-600 hover:underline">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default GalleryImageCard;
