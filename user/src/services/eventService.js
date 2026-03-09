import axiosInstance from "./authService";

export const getPublicEvents = async () => {
  try {
    const response = await axiosInstance.get("/events");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch events" };
  }
};
