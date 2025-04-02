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
  Chip
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import HelpIcon from '@mui/icons-material/Help';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AuthContext from '../../context/AuthContext';

export default function AffectedDashboard() {
  const { user } = useContext(AuthContext);
  const [activeDisasters, setActiveDisasters] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [nearbyResources, setNearbyResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            fetchDashboardData(longitude, latitude);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setError('Unable to access your location. Some features may be limited.');
            fetchDashboardData();
          }
        );
      } else {
        setError('Geolocation is not supported by your browser. Some features may be limited.');
        fetchDashboardData();
      }
    };

    fetchLocation();
  }, [user._id]);

  const fetchDashboardData = async (longitude, latitude) => {
    try {
      setLoading(true);
      setError('');

      // Fetch active disasters
      const activeDisastersResponse = await axios.get('/disasters/active');
      
      // Fetch my help requests
      const helpRequestsResponse = await axios.get('/help-requests');
      const myHelpRequests = helpRequestsResponse.data.data.filter(
        request => request.requestedBy === user._id
      );

      // Set active disasters
      setActiveDisasters(activeDisastersResponse.data.data.slice(0, 3));
      
      // Set my requests
      setMyRequests(myHelpRequests.slice(0, 5));
      
      // Fetch nearby resources if location is available
      if (longitude && latitude) {
        const nearbyResourcesResponse = await axios.get('/resources/nearby', {
          params: { longitude, latitude, maxDistance: 10000 } // 10km radius
        });
        setNearbyResources(nearbyResourcesResponse.data.data.slice(0, 5));
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await axios.put(`/help-requests/${requestId}/cancel`);
      
      // Update my requests list
      setMyRequests(myRequests.map(request => {
        if (request._id === requestId) {
          return { ...request, status: 'Cancelled' };
        }
        return request;
      }));
    } catch (error) {
      console.error('Error cancelling request:', error);
      setError('Failed to cancel request. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Assigned':
        return 'info';
      case 'In Progress':
        return 'primary';
      case 'Resolved':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
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
        Affected Individual Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome, {user?.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Quick Actions" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="contained" 
                fullWidth
                color="warning"
                href="/affected/request-help"
                startIcon={<HelpIcon />}
              >
                Request Help
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="contained" 
                fullWidth
                color="primary"
                href="/affected/resources"
                startIcon={<InventoryIcon />}
              >
                Find Resources
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="contained" 
                fullWidth
                color="success"
                href="/affected/map"
                startIcon={<LocationOnIcon />}
              >
                View Map
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Active Disasters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Active Disasters in Your Area" 
          subheader={location ? `Based on your current location` : `Enable location for more accurate information`}
        />
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
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {disaster.type} - {disaster.severity} severity
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span" color="error">
                          {disaster.alertMessage}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No active disasters in your area at the moment.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* My Requests and Nearby Resources */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="My Help Requests" />
            <Divider />
            <CardContent>
              {myRequests.length > 0 ? (
                <List>
                  {myRequests.map((request) => (
                    <ListItem 
                      key={request._id}
                      secondaryAction={
                        request.status === 'Pending' && (
                          <Button 
                            variant="outlined" 
                            size="small"
                            color="error"
                            onClick={() => handleCancelRequest(request._id)}
                          >
                            Cancel
                          </Button>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <HelpIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <>
                            {request.requestType.map((type) => (
                              <Chip 
                                key={type} 
                                label={type} 
                                size="small" 
                                sx={{ mr: 0.5 }} 
                              />
                            ))}
                            <Chip 
                              label={request.status} 
                              size="small" 
                              color={getStatusColor(request.status)} 
                              sx={{ ml: 1 }} 
                            />
                          </>
                        }
                        secondary={request.description.substring(0, 60) + '...'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You haven't made any help requests yet.
                </Typography>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                href="/affected/my-requests"
              >
                View All My Requests
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Nearby Resources" 
              subheader={location ? `Within 10km of your location` : `Enable location to see nearby resources`}
            />
            <Divider />
            <CardContent>
              {nearbyResources.length > 0 ? (
                <List>
                  {nearbyResources.map((resource) => (
                    <ListItem key={resource._id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <InventoryIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <>
                            {resource.name} 
                            <Chip 
                              label={resource.type} 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1 }} 
                            />
                          </>
                        }
                        secondary={`Quantity: ${resource.quantity} ${resource.unit} • Provided by: ${resource.providedBy.name}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {location ? 'No resources available nearby at the moment.' : 'Enable location to see nearby resources.'}
                </Typography>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                href="/affected/resources"
              >
                View All Resources
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
