import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Attach token automatically to protected requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = async (name, email, password) => {
  try {
    const response = await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to send reset link" };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await axiosInstance.post(
      `/auth/reset-password/${token}`,
      { password }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Password reset failed" };
  }
};

export const googleLogin = async (credential) => {
  try {
    const response = await axiosInstance.post("/auth/google-login", {
      credential,
    });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Google login failed" };
  }
};

export const changePassword = async (current, next, confirm) => {
  try {
    const response = await axiosInstance.put("/auth/change-password", {
      current,
      next,
      confirm,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to change password" };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export default axiosInstance;