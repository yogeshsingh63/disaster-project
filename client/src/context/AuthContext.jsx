import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Setup axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';
  axios.defaults.headers.post['Content-Type'] = 'application/json';

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

  // Handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Unknown error occurred' };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock admin account for testing
      if (email === 'admin@disaster.com' && password === 'admin123') {
        const adminUser = {
          _id: 'admin-123',
          name: 'Admin User',
          email: 'admin@disaster.com',
          role: 'Admin',
          isVerified: true,
          token: 'mock-jwt-token-for-admin',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(adminUser));
        setUser(adminUser);
        navigate('/dashboard/admin');
        return { success: true, message: 'Admin login successful' };
      }
      
      // Mock NGO account for testing
      if (email === 'ngo@disaster.com' && password === 'ngo123') {
        const ngoUser = {
          _id: 'ngo-123',
          name: 'NGO Organization',
          email: 'ngo@disaster.com',
          role: 'NGO',
          isVerified: true,
          token: 'mock-jwt-token-for-ngo',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(ngoUser));
        setUser(ngoUser);
        navigate('/dashboard/ngo');
        return { success: true, message: 'NGO login successful' };
      }
      
      // Mock volunteer account for testing
      if (email === 'volunteer@disaster.com' && password === 'volunteer123') {
        const volunteerUser = {
          _id: 'volunteer-123',
          name: 'Volunteer User',
          email: 'volunteer@disaster.com',
          role: 'Volunteer',
          isVerified: true,
          volunteerDetails: {
            skills: ['First Aid', 'Driving', 'Cooking'],
            availability: 'Full-time',
            isActive: true,
            currentLocation: {
              coordinates: [77.2090, 28.6139] // Delhi
            }
          },
          token: 'mock-jwt-token-for-volunteer',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(volunteerUser));
        setUser(volunteerUser);
        navigate('/dashboard/volunteer');
        return { success: true, message: 'Volunteer login successful' };
      }
      
      // Mock affected individual account for testing
      if (email === 'affected@disaster.com' && password === 'affected123') {
        const affectedUser = {
          _id: 'affected-123',
          name: 'Affected Individual',
          email: 'affected@disaster.com',
          role: 'AffectedIndividual',
          isVerified: true,
          token: 'mock-jwt-token-for-affected',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(affectedUser));
        setUser(affectedUser);
        navigate('/dashboard/affected');
        return { success: true, message: 'Affected Individual login successful' };
      }
      
      // If not using mock accounts, proceed with actual API call
      try {
        const response = await axios.post('/auth/login', { email, password });
        
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
          
          // Redirect based on user role
          const role = response.data.user.role;
          if (role === 'Admin') {
            navigate('/dashboard/admin');
          } else if (role === 'NGO') {
            navigate('/dashboard/ngo');
          } else if (role === 'Volunteer') {
            navigate('/dashboard/volunteer');
          } else if (role === 'AffectedIndividual') {
            navigate('/dashboard/affected');
          }
          
          return { success: true, message: response.data.message };
        }
        return { success: false, message: 'Unknown error occurred' };
      } catch (apiError) {
        console.error('API Login error:', apiError);
        throw apiError; // Re-throw to be caught by outer catch block
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put('/users/profile', profileData);
      
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, message: 'Profile updated successfully' };
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      return { success: false, message: error.response?.data?.message || 'Profile update failed' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
        hasRole,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
