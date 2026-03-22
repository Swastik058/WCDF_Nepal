import axiosInstance from "./authService";

export const applyForVolunteer = async (payload) => {
  try {
    const response = await axiosInstance.post("/volunteers/apply", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit volunteer application" };
  }
};

export const getVolunteerStatus = async () => {
  try {
    const response = await axiosInstance.get("/volunteers/status");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch volunteer status" };
  }
};

export const getVolunteerProfile = async () => {
  try {
    const response = await axiosInstance.get("/volunteers/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch volunteer profile" };
  }
};

export const updateVolunteerProfile = async (payload) => {
  try {
    const response = await axiosInstance.put("/volunteers/profile", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update volunteer profile" };
  }
};

export const getVolunteerDashboard = async () => {
  try {
    const response = await axiosInstance.get("/volunteers/dashboard");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch volunteer dashboard" };
  }
};

export const getMyAssignedActivities = async () => {
  try {
    const response = await axiosInstance.get("/volunteer/activities");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch assigned activities" };
  }
};

export const getMyTrackingHistory = async () => {
  try {
    const response = await axiosInstance.get("/volunteer/tracking-history");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch volunteer tracking history" };
  }
};
