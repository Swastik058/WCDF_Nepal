function GalleryLightbox({ image, onClose }) {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4" onClick={onClose}>
      <div className="max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <img src={image.imageUrl} alt={image.title || image.category?.name || 'Gallery image'} className="max-h-[75vh] w-full object-cover" />
        <div className="space-y-2 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-semibold text-slate-900">{image.title || image.category?.name || 'Gallery image'}</p>
              {image.category?.name ? <p className="mt-1 text-sm text-emerald-700">{image.category.name}</p> : null}
            </div>
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700">
              Close
            </button>
          </div>
          {image.description ? <p className="text-sm leading-6 text-slate-600">{image.description}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default GalleryLightbox;
