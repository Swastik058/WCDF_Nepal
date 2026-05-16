function GalleryImageCard({ image, onEdit, onTogglePublish, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <img src={image.imageUrl} alt={image.title || image.category?.name || 'Gallery image'} className="h-56 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{image.title || 'Untitled image'}</p>
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
            {image.category?.name || 'Uncategorized'}
          </span>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${image.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {image.isPublished ? 'Published' : 'Unpublished'}
          </span>
        </div>

        {image.category?.description ? <p className="text-xs text-slate-500">{image.category.description}</p> : null}
        <p className="text-sm text-slate-600">{image.description || 'No description added yet.'}</p>

        <div className="flex flex-wrap gap-3 text-sm">
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
