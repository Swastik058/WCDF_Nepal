import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  adminLogout,
  getAdminUser,
  hydrateAdminAuthFromUrl,
  isAdminAuthenticated,
} from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateAdminAuthFromUrl();

    if (isAdminAuthenticated()) {
      setUser(getAdminUser());
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const logout = () => {
    adminLogout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}