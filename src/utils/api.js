// Lightweight API client using fetch
// Reads base URL from VITE_API_BASE (default http://localhost:5000)

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function getToken() {
  try {
    const saved = localStorage.getItem('24cr_user');
    if (!saved) return null;
    const user = JSON.parse(saved);
    return user?.token || null;
  } catch {
    return null;
  }
}

function headers(extra = {}) {
  const token = getToken();
  const h = {
    'Content-Type': 'application/json',
    ...extra
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function handle(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: (path, params) => {
    const url = new URL(BASE_URL + path);
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    return fetch(url.toString(), { headers: headers() }).then(handle);
  },
  // Public GET: never attaches Authorization header
  getPublic: (path, params) => {
    const url = new URL(BASE_URL + path);
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    return fetch(url.toString(), { headers: { 'Content-Type': 'application/json' } }).then(handle);
  },
  post: (path, body) => fetch(BASE_URL + path, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body)
  }).then(handle),
  put: (path, body) => fetch(BASE_URL + path, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body)
  }).then(handle),
  del: (path) => fetch(BASE_URL + path, {
    method: 'DELETE',
    headers: headers()
  }).then(handle)
};

export default api;