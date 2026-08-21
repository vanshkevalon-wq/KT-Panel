import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const ROLE_REDIRECTS = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard',
  theory: '/theory/dashboard',
  practical: '/practical/dashboard',
  employee: '/employee/dashboard',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kt_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('kt_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: newToken, ...userData } = res.data;

      localStorage.setItem('kt_token', newToken);
      setToken(newToken);
      setUser(userData);

      showToast(`Welcome back, ${userData.name}!`, 'success');
      return { success: true, role: userData.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await API.post('/auth/logout');
      }
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('kt_token');
      setToken(null);
      setUser(null);
      showToast('Logged out successfully.', 'info');
    }
  };

  const hasPermission = (permissionKey) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.customPermissions && user.customPermissions.includes(permissionKey);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasPermission,
        showToast,
        toast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
