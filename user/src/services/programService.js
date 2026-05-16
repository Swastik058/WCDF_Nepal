import axiosInstance from './authService';

const normalizeProgramsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.programs)) return data.programs;
  return [];
};

export const getPublicPrograms = async () => {
  try {
    const response = await axiosInstance.get('/programs');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch programs' };
  }
};

export const getFeaturedPrograms = async () => {
  try {
    // Preferred future API endpoint for homepage featured programs.
    const response = await axiosInstance.get('/programs/featured');
    return normalizeProgramsArray(response.data);
  } catch (error) {
    if (error.response?.status && error.response.status !== 404) {
      throw error.response?.data || { message: 'Failed to fetch featured programs' };
    }

    // Temporary compatibility path:
    // fall back to the existing public programs endpoint until a dedicated
    // featured-programs endpoint is added on the backend.
    try {
      const fallbackResponse = await axiosInstance.get('/programs');
      return normalizeProgramsArray(fallbackResponse.data);
    } catch (fallbackError) {
      if (fallbackError.response?.status === 404) {
        return [];
      }

      throw fallbackError.response?.data || { message: 'Failed to fetch programs' };
    }
  }
};

export const getPublicProgramBySlug = async (slug) => {
  try {
    const response = await axiosInstance.get(`/programs/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch program details' };
  }
};
