import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, clearSession, getToken, setSession } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jeevansetu_user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    apiRequest('/auth/me')
      .then(({ user: current }) => { setUser(current); localStorage.setItem('jeevansetu_user', JSON.stringify(current)); })
      .catch(() => { clearSession(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const result = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    setSession(result.token, result.user);
    setUser(result.user);
    return result.user;
  }

  async function register(details) {
    const result = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(details) });
    setSession(result.token, result.user);
    setUser(result.user);
    return result.user;
  }

  function logout() { clearSession(); setUser(null); }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
