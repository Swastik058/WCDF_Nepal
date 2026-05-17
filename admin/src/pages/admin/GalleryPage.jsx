import { useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/admin/FormInput';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import GalleryCategoryForm from '../../components/gallery/GalleryCategoryForm';
import GalleryUploadForm from '../../components/gallery/GalleryUploadForm';
import GalleryFilter from '../../components/gallery/GalleryFilter';
import GalleryImageCard from '../../components/gallery/GalleryImageCard';
import { adminApi } from '../../services/adminApi';

const initialCategoryForm = { name: '', description: '', isActive: true };
const initialUploadForm = { categoryId: '', title: '', description: '', isPublished: true };
const initialImageForm = { title: '', description: '', categoryId: '', isPublished: true };

function GalleryPage() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [uploadForm, setUploadForm] = useState(initialUploadForm);
  const [imageForm, setImageForm] = useState(initialImageForm);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingImageId, setEditingImageId] = useState(null);
  const [leftTab, setLeftTab] = useState('categories');

  const [loading, setLoading] = useState(true);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditingCategory = useMemo(() => Boolean(editingCategoryId), [editingCategoryId]);
  const isEditingImage = useMemo(() => Boolean(editingImageId), [editingImageId]);
  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);

  const loadCategories = async () => {
    const data = await adminApi.getGalleryCategories();
    setCategories(data);
    return data;
  };

  const loadImages = async (categoryId = '') => {
    const data = await adminApi.getGalleryImages(categoryId ? { categoryId } : {});
    setImages(data);
    return data;
  };

  const loadGalleryData = async (categoryId = '') => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadCategories(), loadImages(categoryId)]);
    } catch (err) {
      setError(err.message || 'Failed to load gallery data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGalleryData(''); }, []);
  useEffect(() => {
    loadImages(selectedCategoryId).catch((err) => setError(err.message || 'Failed to load gallery images'));
  }, [selectedCategoryId]);

  const handleCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUploadChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUploadForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const { name, value, type, checked } = e.target;
    setImageForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetCategoryForm = () => { setCategoryForm(initialCategoryForm); setEditingCategoryId(null); };
  const resetUploadForm = () => { setUploadForm(initialUploadForm); setSelectedFiles([]); };
  const resetImageForm = () => { setImageForm(initialImageForm); setEditingImageId(null); setLeftTab('categories'); };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) { setError('Category name is required'); return; }
    setCategorySubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = { name: categoryForm.name.trim(), description: categoryForm.description.trim(), isActive: Boolean(categoryForm.isActive) };
      let savedCategory = null;
      if (isEditingCategory) {
        savedCategory = await adminApi.updateGalleryCategory(editingCategoryId, payload);
        setSuccessMessage('Category updated.');
      } else {
        savedCategory = await adminApi.createGalleryCategory(payload);
        setSuccessMessage('Category created.');
      }
      resetCategoryForm();
      await loadCategories();
      if (savedCategory?._id && savedCategory?.isActive) {
        setUploadForm((prev) => ({ ...prev, categoryId: savedCategory._id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({ name: category.name || '', description: category.description || '', isActive: Boolean(category.isActive) });
    setError('');
    setSuccessMessage('');
    setLeftTab('categories');
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Delete this category? It cannot be deleted while images still belong to it.')) return;
    setError('');
    setSuccessMessage('');
    try {
      await adminApi.deleteGalleryCategory(id);
      setSuccessMessage('Category deleted.');
      await loadCategories();
      if (editingCategoryId === id) resetCategoryForm();
      if (uploadForm.categoryId === id) setUploadForm((prev) => ({ ...prev, categoryId: '' }));
      if (selectedCategoryId === id) setSelectedCategoryId('');
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.categoryId) { setError('Please select a category'); return; }
    if (!selectedFiles.length) { setError('Please select at least one image'); return; }
    setUploadSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      const formData = new FormData();
      formData.append('categoryId', uploadForm.categoryId);
      formData.append('title', uploadForm.title.trim());
      formData.append('description', uploadForm.description.trim());
      formData.append('isPublished', String(Boolean(uploadForm.isPublished)));
      selectedFiles.forEach((file) => formData.append('images', file));
      const response = await adminApi.uploadGalleryImages(formData);
      setSuccessMessage(`${response.length || 0} image(s) uploaded.`);
      await loadGalleryData(selectedCategoryId);
      resetUploadForm();
    } catch (err) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleImageEdit = (image) => {
    setEditingImageId(image._id);
    setImageForm({ title: image.title || '', description: image.description || '', categoryId: image.category?._id || '', isPublished: Boolean(image.isPublished) });
    setError('');
    setSuccessMessage('');
    setLeftTab('edit');
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!editingImageId) return;
    if (!imageForm.categoryId) { setError('Please select a category'); return; }
    setImageSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      await adminApi.updateGalleryImage(editingImageId, {
        title: imageForm.title.trim(),
        description: imageForm.description.trim(),
        categoryId: imageForm.categoryId,
        isPublished: Boolean(imageForm.isPublished),
      });
      setSuccessMessage('Image updated.');
      resetImageForm();
      await loadGalleryData(selectedCategoryId);
    } catch (err) {
      setError(err.message || 'Failed to update image');
    } finally {
      setImageSaving(false);
    }
  };

  const handleTogglePublish = async (id) => {
    setError('');
    setSuccessMessage('');
    try {
      await adminApi.toggleGalleryImagePublish(id);
      setSuccessMessage('Publish status updated.');
      await loadGalleryData(selectedCategoryId);
    } catch (err) {
      setError(err.message || 'Failed to toggle publish status');
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Delete this gallery image?')) return;
    setError('');
    setSuccessMessage('');
    try {
      await adminApi.deleteGalleryImage(id);
      setSuccessMessage('Image deleted.');
      if (editingImageId === id) resetImageForm();
      await loadGalleryData(selectedCategoryId);
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    }
  };

  const tabs = [
    { id: 'categories', label: 'Categories' },
    { id: 'upload', label: 'Upload', disabled: activeCategories.length === 0 },
    { id: 'edit', label: 'Edit Image', disabled: !isEditingImage },
  ];

  return (
    <div>
      <PageHeader title="Gallery Management" description="Manage categories and gallery photos." />

      {successMessage ? (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* Left panel — tabbed */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setLeftTab(tab.id)}
                className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  leftTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {leftTab === 'categories' && (
              <div className="space-y-4">
                <GalleryCategoryForm
                  form={categoryForm}
                  onChange={handleCategoryChange}
                  onSubmit={handleCategorySubmit}
                  onCancel={resetCategoryForm}
                  isEditing={isEditingCategory}
                  submitting={categorySubmitting}
                  error=""
                  successMessage=""
                />

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">All Categories</h3>
                  <TableState loading={loading} error="" empty={!loading && categories.length === 0} emptyText="No categories yet." />
                  {!loading && categories.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {categories.map((category) => (
                        <div key={category._id} className="flex items-center gap-2 py-2 text-sm">
                          <span className="min-w-0 flex-1 truncate font-medium text-slate-900" title={category.name}>
                            {category.name}
                          </span>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {category.isActive ? 'Active' : 'Off'}
                          </span>
                          <span className="shrink-0 text-xs text-slate-400" title="Published / Total">
                            {category.publishedImageCount || 0}/{category.imageCount || 0}
                          </span>
                          <button type="button" onClick={() => handleCategoryEdit(category)} className="shrink-0 text-xs text-indigo-600 hover:underline">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleCategoryDelete(category._id)} className="shrink-0 text-xs text-rose-600 hover:underline">
                            Del
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {leftTab === 'upload' && (
              activeCategories.length === 0 ? (
                <p className="text-sm text-amber-700">Create and activate a category first.</p>
              ) : (
                <GalleryUploadForm
                  categories={activeCategories}
                  form={uploadForm}
                  onChange={handleUploadChange}
                  onFileChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  onSubmit={handleUploadSubmit}
                  onCancel={resetUploadForm}
                  selectedFiles={selectedFiles}
                  submitting={uploadSubmitting}
                  error=""
                  successMessage=""
                />
              )
            )}

            {leftTab === 'edit' && (
              <form onSubmit={handleImageSubmit} className="space-y-3">
                <h2 className="text-base font-semibold text-slate-900">Edit Image</h2>

                <FormInput label="Title" name="title" value={imageForm.title} onChange={handleImageChange} />

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Description</span>
                  <textarea
                    name="description"
                    value={imageForm.description}
                    onChange={handleImageChange}
                    rows={2}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  />
                </label>

                <GalleryFilter
                  label="Category"
                  value={imageForm.categoryId}
                  onChange={(value) => setImageForm((prev) => ({ ...prev, categoryId: value }))}
                  categories={categories}
                  includeAll={false}
                />

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="isPublished" checked={imageForm.isPublished} onChange={handleImageChange} />
                  Published
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!isEditingImage || imageSaving}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
                  >
                    {imageSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={resetImageForm} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right panel — image grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">Gallery Images</h2>
            <GalleryFilter value={selectedCategoryId} onChange={setSelectedCategoryId} categories={categories} compact />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <TableState loading={loading} error="" empty={!loading && images.length === 0} emptyText="No gallery images found." />
            {!loading && images.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <GalleryImageCard
                    key={image._id}
                    image={image}
                    onEdit={handleImageEdit}
                    onTogglePublish={handleTogglePublish}
                    onDelete={handleDeleteImage}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GalleryPage;
