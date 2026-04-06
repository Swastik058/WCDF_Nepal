import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const axiosPublic = axios.create({
  baseURL: API_URL,
});

export const fetchPublicChildren = async () => {
  try {
    const response = await axiosPublic.get("/children/public");
    return response.data?.children || response.data || [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to load children" };
  }
};

export const fetchPublicChild = async (identifier) => {
  try {
    const response = await axiosPublic.get(`/children/public/${identifier}`);
    return response.data?.child || response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load child profile" };
  }
};
