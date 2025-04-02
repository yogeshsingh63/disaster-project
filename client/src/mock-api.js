import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';

// Add token to every request if user is logged in
axios.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export API functions
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user profile' };
  }
};

export const getUnverifiedUsers = async () => {
  try {
    const response = await axios.get('/users/unverified');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get unverified users' };
  }
};

export const verifyUser = async (userId) => {
  try {
    const response = await axios.put(`/users/verify/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to verify user' };
  }
};

export const getActiveDisasters = async () => {
  try {
    const response = await axios.get('/disasters/active');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get active disasters' };
  }
};

export const getAllDisasters = async () => {
  try {
    const response = await axios.get('/disasters');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get disasters' };
  }
};

export const getResources = async () => {
  try {
    const response = await axios.get('/resources');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get resources' };
  }
};

export const getNGOResources = async (ngoId) => {
  try {
    const response = await axios.get(`/resources/ngo/${ngoId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get NGO resources' };
  }
};

export const getHelpRequests = async () => {
  try {
    const response = await axios.get('/help-requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get help requests' };
  }
};

export const getHelpRequestsByStatus = async (status) => {
  try {
    const response = await axios.get(`/help-requests/status/${status}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get help requests by status' };
  }
};
