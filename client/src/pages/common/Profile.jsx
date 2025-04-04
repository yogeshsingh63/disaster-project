import { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import axios from 'axios';
import PersonIcon from '@mui/icons-material/Person';
import AuthContext from '../../context/AuthContext';

export default function Profile() {
  const { user, updateProfile, loading: authLoading, error: authError } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    }
  });
  const [success, setSuccess] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch profile data from API
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/users/profile');
        if (response.data.success) {
          setProfileData(response.data.data);
          
          // Update form data with fetched profile
          const profile = response.data.data;
          setFormData({
            name: profile.name || '',
            phone: profile.phone || '',
            address: {
              street: profile.address?.street || '',
              city: profile.address?.city || '',
              state: profile.address?.state || '',
              pincode: profile.address?.pincode || '',
              country: profile.address?.country || 'India'
            }
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again.');
        // Fallback to context user if API fails
        if (user) {
          setFormData({
            name: user.name || '',
            phone: user.phone || '',
            address: {
              street: user.address?.street || '',
              city: user.address?.city || '',
              state: user.address?.state || '',
              pincode: user.address?.pincode || '',
              country: user.address?.country || 'India'
            }
          });
        }
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setLocalLoading(true);
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 80, height: 80 }}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} style={{ width: '100%', height: '100%' }} />
            ) : (
              <PersonIcon sx={{ fontSize: 50 }} />
            )}
          </Avatar>
          <Typography component="h1" variant="h5" gutterBottom>
            {profileData?.name || user?.name || 'User'}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {profileData?.email || user?.email || 'No email'} • {profileData?.role || user?.role || 'User'}
          </Typography>
          
          {(error || authError) && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error || authError}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address.street"
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="address.city"
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="address.state"
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="address.pincode"
                  label="Pincode"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="address.country"
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={localLoading}
            >
              {localLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
