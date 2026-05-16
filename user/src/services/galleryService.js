import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosPublic = axios.create({
  baseURL: API_URL,
});

export const fetchPublicGalleryCategories = async () => {
  try {
    const response = await axiosPublic.get("/gallery/categories");
    return response.data || [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to load gallery categories" };
  }
};

export const fetchPublicGalleryImages = async () => {
  try {
    const response = await axiosPublic.get("/gallery/images");
    return response.data || [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to load gallery images" };
  }
};

export const fetchPublicGalleryImagesByCategory = async (categoryId) => {
  try {
    const response = await axiosPublic.get(`/gallery/images/category/${categoryId}`);
    return response.data || [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to load gallery images for this category" };
  }
};
