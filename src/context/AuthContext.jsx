import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = localStorage.getItem('fci_token');
      if (!token) { setIsLoading(false); return; }

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('fci_token');
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem('fci_token');
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث بيانات المستخدم في الـ state مباشرة (بدون re-fetch)
  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || 'فشل تسجيل الدخول' };

      localStorage.setItem('fci_token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, role: data.user.role };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالسيرفر' };
    }
  };

  const register = async (name, email, password, year, studentId) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, year, studentId }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || 'فشل التسجيل' };

      localStorage.setItem('fci_token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, role: data.user.role };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالسيرفر' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('fci_token');
  };

  const getToken = () => localStorage.getItem('fci_token');

  const authFetch = async (url, options = {}) => {
    const token = getToken();
    return fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoading,
      login, register, logout,
      restoreSession, updateUser,
      getToken, authFetch,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);