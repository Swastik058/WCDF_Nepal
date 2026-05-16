function GalleryImageCard({ image, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(image)}
      className="overflow-hidden rounded-2xl bg-slate-100 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5"
    >
      <img
        className="h-64 w-full object-cover transition duration-300 hover:scale-[1.02]"
        src={image.imageUrl}
        alt={image.title || image.category?.name || 'Gallery image'}
        loading="lazy"
      />
      <div className="space-y-2 p-4">
        <p className="font-semibold text-slate-900">{image.title || 'Gallery image'}</p>
        <p className="text-sm text-slate-500">{image.category?.name}</p>
      </div>
    </button>
  );
}

export default GalleryImageCard;
