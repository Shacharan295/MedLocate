import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medlocate_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('medlocate_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    // Verify token validity on load
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('medlocate_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Token verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.token) {
      localStorage.setItem('medlocate_token', res.data.token);
      localStorage.setItem('medlocate_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data.token) {
      localStorage.setItem('medlocate_token', res.data.token);
      localStorage.setItem('medlocate_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('medlocate_token');
    localStorage.removeItem('medlocate_user');
    setToken(null);
    setUser(null);
  };

  const isPatient = user?.role === 'patient';
  const isPharmacy = user?.role === 'pharmacy';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isPatient,
        isPharmacy,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
