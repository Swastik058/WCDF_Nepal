import { useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/admin/FormInput';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import GalleryCategoryForm from '../../components/gallery/GalleryCategoryForm';
import GalleryUploadForm from '../../components/gallery/GalleryUploadForm';
import GalleryFilter from '../../components/gallery/GalleryFilter';
import GalleryImageCard from '../../components/gallery/GalleryImageCard';
import { adminApi } from '../../services/adminApi';

const initialCategoryForm = {
  name: '',
  description: '',
  isActive: true,
};

const initialUploadForm = {
  categoryId: '',
  title: '',
  description: '',
  isPublished: true,
};

const initialImageForm = {
  title: '',
  description: '',
  categoryId: '',
  isPublished: true,
};

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

  const [loading, setLoading] = useState(true);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditingCategory = useMemo(() => Boolean(editingCategoryId), [editingCategoryId]);
  const isEditingImage = useMemo(() => Boolean(editingImageId), [editingImageId]);
  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );

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

  useEffect(() => {
    loadGalleryData('');
  }, []);

  useEffect(() => {
    loadImages(selectedCategoryId).catch((err) => {
      setError(err.message || 'Failed to load gallery images');
    });
  }, [selectedCategoryId]);

  const handleCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUploadChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUploadForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const { name, value, type, checked } = e.target;
    setImageForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetCategoryForm = () => {
    setCategoryForm(initialCategoryForm);
    setEditingCategoryId(null);
  };

  const resetUploadForm = () => {
    setUploadForm(initialUploadForm);
    setSelectedFiles([]);
  };

  const resetImageForm = () => {
    setImageForm(initialImageForm);
    setEditingImageId(null);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    setCategorySubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        isActive: Boolean(categoryForm.isActive),
      };

      let savedCategory = null;
      if (isEditingCategory) {
        savedCategory = await adminApi.updateGalleryCategory(editingCategoryId, payload);
        setSuccessMessage('Gallery category updated successfully.');
      } else {
        savedCategory = await adminApi.createGalleryCategory(payload);
        setSuccessMessage('Gallery category created successfully.');
      }

      resetCategoryForm();
      await loadCategories();

      if (savedCategory?._id && savedCategory?.isActive) {
        setUploadForm((prev) => ({ ...prev, categoryId: savedCategory._id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to save gallery category');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleCategoryEdit = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      isActive: Boolean(category.isActive),
    });
    setError('');
    setSuccessMessage('');
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Delete this category? It cannot be deleted while images still belong to it.')) return;

    setError('');
    setSuccessMessage('');
    try {
      await adminApi.deleteGalleryCategory(id);
      setSuccessMessage('Gallery category deleted successfully.');
      await loadCategories();
      if (editingCategoryId === id) resetCategoryForm();
      if (uploadForm.categoryId === id) {
        setUploadForm((prev) => ({ ...prev, categoryId: '' }));
      }
      if (selectedCategoryId === id) {
        setSelectedCategoryId('');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete gallery category');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!uploadForm.categoryId) {
      setError('Please select a category before uploading images');
      return;
    }

    if (!selectedFiles.length) {
      setError('Please select at least one image');
      return;
    }

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
      setSuccessMessage(`${response.length || 0} image(s) uploaded successfully.`);
      await loadGalleryData(selectedCategoryId);
      resetUploadForm();
    } catch (err) {
      setError(err.message || 'Failed to upload gallery images');
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleImageEdit = (image) => {
    setEditingImageId(image._id);
    setImageForm({
      title: image.title || '',
      description: image.description || '',
      categoryId: image.category?._id || '',
      isPublished: Boolean(image.isPublished),
    });
    setError('');
    setSuccessMessage('');
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!editingImageId) return;

    if (!imageForm.categoryId) {
      setError('Please select a category');
      return;
    }

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
      setSuccessMessage('Gallery image updated successfully.');
      resetImageForm();
      await loadGalleryData(selectedCategoryId);
    } catch (err) {
      setError(err.message || 'Failed to update gallery image');
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
      setSuccessMessage('Gallery image deleted successfully.');
      if (editingImageId === id) resetImageForm();
      await loadGalleryData(selectedCategoryId);
    } catch (err) {
      setError(err.message || 'Failed to delete gallery image');
    }
  };

  return (
    <div>
      <PageHeader title="Gallery Management" description="Create categories first, then choose a category on the same page and upload gallery photos" />

      {successMessage ? <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}
      {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
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

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Loading categories...</div>
          ) : activeCategories.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
              Create and activate a category first. Then you can select it from the dropdown below and upload photos on this same page.
            </div>
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
          )}

          <form onSubmit={handleImageSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Edit Selected Image</h2>
            {!isEditingImage ? <p className="text-sm text-slate-600">Select an uploaded image from the right side to edit it.</p> : null}

            <FormInput label="Title" name="title" value={imageForm.title} onChange={handleImageChange} />

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Description</span>
              <textarea
                name="description"
                value={imageForm.description}
                onChange={handleImageChange}
                rows={3}
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
              <button type="submit" disabled={!isEditingImage || imageSaving} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70">
                {imageSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {isEditingImage ? (
                <button type="button" onClick={resetImageForm} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <GalleryFilter value={selectedCategoryId} onChange={setSelectedCategoryId} categories={categories} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Existing Categories</h2>
            <div className="mt-3">
              <TableState loading={loading} error="" empty={!loading && categories.length === 0} emptyText="No gallery categories found." />

              {!loading && categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category._id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{category.name}</p>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{category.description || 'No description added yet.'}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Total images: {category.imageCount || 0} | Published: {category.publishedImageCount || 0}
                      </p>
                      <div className="mt-3 flex gap-3 text-sm">
                        <button type="button" onClick={() => handleCategoryEdit(category)} className="text-indigo-600 hover:underline">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleCategoryDelete(category._id)} className="text-rose-600 hover:underline">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Gallery Images</h2>
            <div className="mt-4">
              <TableState loading={loading} error="" empty={!loading && images.length === 0} emptyText="No gallery images found." />

              {!loading && images.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
}

export default GalleryPage;
