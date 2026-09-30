import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app load
    async function checkAuth() {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setUser(null);
          localStorage.removeItem('auth_token');
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        setUser(null);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth_logout', handleAuthLogout);
    return () => window.removeEventListener('auth_logout', handleAuthLogout);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.user) {
      setUser(res.user);
      if (res.token) {
        localStorage.setItem('auth_token', res.token);
      }
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
