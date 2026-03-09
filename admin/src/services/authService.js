const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USER_LOGIN_URL = import.meta.env.VITE_USER_LOGIN_URL || 'http://localhost:3000/login';

export const adminLogin = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Admin login failed');
  }

  if (!data?.token || !data?.user) {
    throw new Error('Invalid login response');
  }

  localStorage.setItem('adminToken', data.token);
  localStorage.setItem('adminUser', JSON.stringify(data.user));

  return data;
};

export const hydrateAdminAuthFromUrl = () => {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');
  const userRaw = url.searchParams.get('user');

  if (!token || !userRaw) {
    return false;
  }

  try {
    const user = JSON.parse(userRaw);

    if (user?.role !== 'admin') {
      return false;
    }

    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));

    url.searchParams.delete('token');
    url.searchParams.delete('user');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

    return true;
  } catch {
    return false;
  }
};

export const redirectToUserLogin = (fromPath = '/home') => {
  const target = `${USER_LOGIN_URL}?next=${encodeURIComponent(fromPath)}`;
  window.location.assign(target);
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export const getAdminToken = () => localStorage.getItem('adminToken');

export const getAdminUser = () => {
  const raw = localStorage.getItem('adminUser');
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  const user = getAdminUser();
  return Boolean(token && user && user.role === 'admin');
};
