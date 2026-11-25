const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('jeevansetu_token');
}

export function setSession(token, user) {
  localStorage.setItem('jeevansetu_token', token);
  localStorage.setItem('jeevansetu_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('jeevansetu_token');
  localStorage.removeItem('jeevansetu_user');
}

export async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}
