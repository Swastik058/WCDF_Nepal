import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GalleryFilter from '../components/gallery/GalleryFilter';
import GalleryImageCard from '../components/gallery/GalleryImageCard';
import GalleryLightbox from '../components/gallery/GalleryLightbox';
import { fetchPublicGalleryCategories, fetchPublicGalleryImages, fetchPublicGalleryImagesByCategory } from '../services/galleryService';

function Gallery() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeCategory = useMemo(
    () => categories.find((item) => item._id === activeCategoryId) || null,
    [categories, activeCategoryId],
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchPublicGalleryCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Failed to load gallery categories');
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError('');

      try {
        const data = activeCategoryId
          ? await fetchPublicGalleryImagesByCategory(activeCategoryId)
          : await fetchPublicGalleryImages();

        setImages(data);
      } catch (err) {
        setError(err.message || 'Failed to load gallery images');
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [activeCategoryId]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center px-6 py-20">
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow sm:text-5xl">Gallery</h1>
          <p className="max-w-2xl text-lg text-white/90">Stories, moments, and community highlights from our programs and events.</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Gallery</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Stories, moments, and community highlights</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Explore published gallery photos from WCDF. Filter by category to browse specific events, programs, and activities.
            </p>
          </div>

          <GalleryFilter categories={categories} activeCategoryId={activeCategoryId} onSelectCategory={setActiveCategoryId} />

          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {activeCategory ? activeCategory.name : 'All categories'}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {activeCategory?.description || 'Browse all published gallery images from active categories.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? <p className="col-span-full text-center text-slate-500">Loading gallery...</p> : null}
            {!loading && error ? <p className="col-span-full text-center text-rose-600">{error}</p> : null}
            {!loading && !error && images.length === 0 ? (
              <p className="col-span-full text-center text-slate-500">No published gallery images are available for this category yet.</p>
            ) : null}

            {!loading && !error
              ? images.map((image) => (
                  <GalleryImageCard key={image._id} image={image} onClick={setSelectedImage} />
                ))
              : null}
          </div>
        </section>
      </main>

      <GalleryLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
      <Footer />
    </div>
  );
}

export default Gallery;
