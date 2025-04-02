import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HelpIcon from '@mui/icons-material/Help';
import WarningIcon from '@mui/icons-material/Warning';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AuthContext from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';

export default function VolunteerDashboard() {
  const { user } = useContext(AuthContext);
  const { updateLocation } = useContext(SocketContext);
  const [stats, setStats] = useState({
    assignments: { total: 0, inProgress: 0, completed: 0 }
  });
  const [activeDisasters, setActiveDisasters] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch volunteer status
        const profileResponse = await axios.get('/auth/me');
        setIsActive(profileResponse.data.user.volunteerDetails?.isActive || false);

        // Fetch resources assigned to volunteer
        const resourcesResponse = await axios.get('/resources');
        const assignedResources = resourcesResponse.data.data.filter(
          resource => resource.assignedVolunteers.includes(user._id)
        );
        
        const inProgressResources = assignedResources.filter(
          resource => resource.status === 'In Transit'
        );
        
        const completedResources = assignedResources.filter(
          resource => resource.status === 'Delivered' || resource.status === 'Depleted'
        );

        // Fetch active disasters
        const activeDisastersResponse = await axios.get('/disasters/active');

        // Update stats
        setStats({
          assignments: {
            total: assignedResources.length,
            inProgress: inProgressResources.length,
            completed: completedResources.length
          }
        });

        // Set active disasters
        setActiveDisasters(activeDisastersResponse.data.data.slice(0, 3));
        
        // Set assignments
        setAssignments(inProgressResources.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user._id]);

  const handleActiveToggle = async () => {
    try {
      await axios.put('/users/profile', {
        volunteerDetails: {
          isActive: !isActive
        }
      });
      
      setIsActive(!isActive);
      
      // If becoming active and location sharing is enabled, update location
      if (!isActive && locationSharing) {
        handleShareLocation();
      }
    } catch (error) {
      console.error('Error updating active status:', error);
      setError('Failed to update active status. Please try again.');
    }
  };

  const handleLocationSharingToggle = () => {
    if (!locationSharing) {
      // Start sharing location
      handleShareLocation();
    } else {
      // Stop sharing location
      setLocationSharing(false);
      setLocationError('');
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update location in database
          updateLocationInDB(longitude, latitude);
          
          // Send location update via socket
          updateLocation({
            volunteerId: user._id,
            coordinates: [longitude, latitude],
            timestamp: new Date().toISOString()
          });
          
          setLocationSharing(true);
          setLocationError('');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to access your location. Please check your browser settings.');
          setLocationSharing(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationSharing(false);
    }
  };

  const updateLocationInDB = async (longitude, latitude) => {
    try {
      await axios.put('/users/location', {
        coordinates: [longitude, latitude]
      });
    } catch (error) {
      console.error('Error updating location in database:', error);
      setError('Failed to update location in database.');
    }
  };

  const handleUpdateResourceStatus = async (resourceId, newStatus) => {
    try {
      await axios.put(`/resources/${resourceId}/status`, {
        status: newStatus
      });
      
      // Update assignments list
      setAssignments(assignments.map(resource => {
        if (resource._id === resourceId) {
          return { ...resource, status: newStatus };
        }
        return resource;
      }));
      
      // Update stats
      if (newStatus === 'Delivered' || newStatus === 'Depleted') {
        setStats(prevStats => ({
          assignments: {
            ...prevStats.assignments,
            inProgress: prevStats.assignments.inProgress - 1,
            completed: prevStats.assignments.completed + 1
          }
        }));
      }
    } catch (error) {
      console.error('Error updating resource status:', error);
      setError('Failed to update resource status. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Volunteer Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={handleActiveToggle}
                    color="success"
                  />
                }
                label={isActive ? "Active for Duty" : "Inactive"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={locationSharing}
                    onChange={handleLocationSharingToggle}
                    color="primary"
                    disabled={!isActive}
                  />
                }
                label="Share Location"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                startIcon={<MyLocationIcon />}
                disabled={!isActive || locationSharing}
                onClick={handleShareLocation}
              >
                Update Location
              </Button>
            </Grid>
          </Grid>
          {locationError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {locationError}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Assignment Statistics" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{stats.assignments.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Assignments
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{stats.assignments.inProgress}</Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{stats.assignments.completed}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Active Assignments and Disasters */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader title="Current Assignments" />
            <Divider />
            <CardContent>
              {assignments.length > 0 ? (
                <List>
                  {assignments.map((resource) => (
                    <ListItem 
                      key={resource._id}
                      secondaryAction={
                        <Button 
                          variant="contained" 
                          size="small"
                          color="success"
                          onClick={() => handleUpdateResourceStatus(resource._id, 'Delivered')}
                        >
                          Mark Delivered
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <LocalShippingIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <>
                            {resource.name} ({resource.type})
                            <Chip 
                              label={resource.status} 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1 }} 
                            />
                          </>
                        }
                        secondary={`Quantity: ${resource.quantity} ${resource.unit}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active assignments at the moment.
                </Typography>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                href="/volunteer/assignments"
              >
                View All Assignments
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader title="Active Disasters" />
            <Divider />
            <CardContent>
              {activeDisasters.length > 0 ? (
                <List>
                  {activeDisasters.map((disaster) => (
                    <ListItem key={disaster._id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={disaster.name}
                        secondary={`${disaster.type} - ${disaster.severity} severity`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active disasters at the moment.
                </Typography>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                href="/volunteer/map"
              >
                View Disaster Map
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
