const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
};

const getToken = () => localStorage.getItem('adminToken');

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const get = async (path, params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE}${path}${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseResponse(response);
};

const post = async (path, body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  return parseResponse(response);
};

const postForm = async (path, formData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  return parseResponse(response);
};

const put = async (path, body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  return parseResponse(response);
};

const patch = async (path, body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  return parseResponse(response);
};

const del = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return parseResponse(response);
};

export const adminApi = {
  getDashboard: () => get('/admin/dashboard'),
  getDashboardStats: async () => {
    try {
      return await get('/admin/stats');
    } catch (error) {
      if (error.status === 404) {
        return get('/admin/dashboard');
      }
      throw error;
    }
  },

  getChildren: () => get('/admin/children'),
  createChild: (payload) => post('/admin/children', payload),
  updateChild: (id, payload) => put(`/admin/children/${id}`, payload),
  deleteChild: (id) => del(`/admin/children/${id}`),
  getSponsorships: () => get('/admin/sponsorships'),

  getEvents: () => get('/admin/events'),
  createEvent: (payload) => post('/admin/events', payload),
  updateEvent: (id, payload) => put(`/admin/events/${id}`, payload),
  deleteEvent: (id) => del(`/admin/events/${id}`),
  getPrograms: () => get('/admin/programs'),
  createProgram: (payload) => post('/admin/programs', payload),
  updateProgram: (id, payload) => put(`/admin/programs/${id}`, payload),
  deleteProgram: (id) => del(`/admin/programs/${id}`),
  getGalleryCategories: () => get('/admin/gallery/categories'),
  createGalleryCategory: (payload) => post('/admin/gallery/categories', payload),
  updateGalleryCategory: (id, payload) => put(`/admin/gallery/categories/${id}`, payload),
  deleteGalleryCategory: (id) => del(`/admin/gallery/categories/${id}`),
  uploadGalleryImages: (formData) => postForm('/admin/gallery/upload', formData),
  getGalleryImages: (params) => get('/admin/gallery/images', params),
  updateGalleryImage: (id, payload) => put(`/admin/gallery/images/${id}`, payload),
  deleteGalleryImage: (id) => del(`/admin/gallery/images/${id}`),
  toggleGalleryImagePublish: (id) => patch(`/admin/gallery/images/${id}/toggle-publish`, {}),
  getApprovedVolunteers: () => get('/admin/volunteers/approved'),
  getAssignedVolunteersForActivity: (activityId) => get(`/admin/activities/${activityId}/assigned-volunteers`),
  assignVolunteerToActivity: (activityId, payload) => put(`/admin/activities/${activityId}/assign-volunteer`, payload),
  removeVolunteerFromActivity: (activityId, payload) => put(`/admin/activities/${activityId}/remove-volunteer`, payload),
  updateVolunteerTrackingForActivity: (activityId, volunteerId, payload) => put(`/admin/activities/${activityId}/track-volunteer/${volunteerId}`, payload),
  getVolunteerTrackingForActivity: (activityId) => get(`/admin/activities/${activityId}/tracking`),

  getExpenses: () => get('/admin/expenses'),
  createExpense: (payload) => post('/admin/expenses', payload),
  updateExpense: (id, payload) => put(`/admin/expenses/${id}`, payload),
  deleteExpense: (id) => del(`/admin/expenses/${id}`),

  getVolunteers: (params) => get('/admin/volunteers', params),
  updateVolunteerStatus: (id, payload) => patch(`/admin/volunteers/${id}/status`, payload),

  getDonations: (params) => get('/admin/donations', params),
  getBlockchainRecords: (params) => get('/admin/blockchain-records', params),
  getReports: (params) => get('/admin/reports', params),
};
