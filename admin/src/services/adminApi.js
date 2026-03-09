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

  getChildren: () => get('/admin/children'),
  createChild: (payload) => post('/admin/children', payload),
  updateChild: (id, payload) => put(`/admin/children/${id}`, payload),
  deleteChild: (id) => del(`/admin/children/${id}`),

  getEvents: () => get('/admin/events'),
  createEvent: (payload) => post('/admin/events', payload),
  updateEvent: (id, payload) => put(`/admin/events/${id}`, payload),
  deleteEvent: (id) => del(`/admin/events/${id}`),

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
