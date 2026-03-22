import { createContext, useContext, useState, useEffect } from "react";
import { 
  getCurrentUser, 
  fetchCurrentUser,
  isAuthenticated as checkAuth, 
  logout as serviceLogout,
  setCurrentUser,
} from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on first render
  useEffect(() => {
    const loadUser = async () => {
      if (!checkAuth()) {
        setLoading(false);
        return;
      }

      const localUser = getCurrentUser();
      if (localUser) {
        setUser(localUser);
      }

      try {
        const response = await fetchCurrentUser();
        setUser(response.user);
      } catch (error) {
        serviceLogout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = (userData) => {
    setUser(userData);
    setCurrentUser(userData);
  };

  const updateUser = (userData) => {
    setUser(userData);
    setCurrentUser(userData);
  };

  // Logout
  const logout = () => {
    serviceLogout(); // removes token + user from localStorage
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    updateUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
