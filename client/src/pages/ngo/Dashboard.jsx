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
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import HelpIcon from '@mui/icons-material/Help';
import WarningIcon from '@mui/icons-material/Warning';
import AuthContext from '../../context/AuthContext';

export default function NGODashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    resources: { total: 0, available: 0 },
    volunteers: { total: 0, active: 0 },
    helpRequests: { total: 0, pending: 0, assigned: 0 }
  });
  const [activeDisasters, setActiveDisasters] = useState([]);
  const [pendingHelpRequests, setPendingHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch resources stats
        const resourcesResponse = await axios.get(`/resources/ngo/${user._id}`);
        const availableResources = resourcesResponse.data.data.filter(
          resource => resource.isAvailable
        );
        
        // Fetch volunteers stats (only verified volunteers)
        const volunteersResponse = await axios.get('/users/role/Volunteer');
        const verifiedVolunteers = volunteersResponse.data.data.filter(
          volunteer => volunteer.isVerified
        );
        const activeVolunteers = verifiedVolunteers.filter(
          volunteer => volunteer.volunteerDetails?.isActive
        );
        
        // Fetch help requests stats
        const helpRequestsResponse = await axios.get('/help-requests');
        const pendingRequests = helpRequestsResponse.data.data.filter(
          request => request.status === 'Pending'
        );
        const assignedRequests = helpRequestsResponse.data.data.filter(
          request => request.status === 'Assigned' && 
                    request.assignedTo.ngo && 
                    request.assignedTo.ngo === user._id
        );

        // Fetch active disasters
        const activeDisastersResponse = await axios.get('/disasters/active');

        // Update stats
        setStats({
          resources: {
            total: resourcesResponse.data.count,
            available: availableResources.length
          },
          volunteers: {
            total: verifiedVolunteers.length,
            active: activeVolunteers.length
          },
          helpRequests: {
            total: helpRequestsResponse.data.count,
            pending: pendingRequests.length,
            assigned: assignedRequests.length
          }
        });

        // Set active disasters
        setActiveDisasters(activeDisastersResponse.data.data.slice(0, 5));
        
        // Set pending help requests
        setPendingHelpRequests(pendingRequests.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user._id]);

  const handleAssignHelpRequest = async (requestId) => {
    try {
      await axios.put(`/help-requests/${requestId}/assign`, {
        ngo: user._id
      });
      
      // Update pending help requests list
      setPendingHelpRequests(pendingHelpRequests.filter(request => request._id !== requestId));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        helpRequests: {
          ...prevStats.helpRequests,
          pending: prevStats.helpRequests.pending - 1,
          assigned: prevStats.helpRequests.assigned + 1
        }
      }));
    } catch (error) {
      console.error('Error assigning help request:', error);
      setError('Failed to assign help request. Please try again.');
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
        NGO Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <InventoryIcon />
                </Avatar>
                <Typography variant="h6">Resources</Typography>
              </Box>
              <Typography variant="h4">{stats.resources.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.resources.available} available for distribution
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Volunteers</Typography>
              </Box>
              <Typography variant="h4">{stats.volunteers.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.volunteers.active} currently active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <HelpIcon />
                </Avatar>
                <Typography variant="h6">Help Requests</Typography>
              </Box>
              <Typography variant="h4">{stats.helpRequests.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.helpRequests.pending} pending, {stats.helpRequests.assigned} assigned to you
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Disasters and Pending Help Requests */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
                href="/ngo/map"
              >
                View Disaster Map
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Pending Help Requests" />
            <Divider />
            <CardContent>
              {pendingHelpRequests.length > 0 ? (
                <List>
                  {pendingHelpRequests.map((request) => (
                    <ListItem 
                      key={request._id}
                      secondaryAction={
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleAssignHelpRequest(request._id)}
                        >
                          Assign to Us
                        </Button>
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
                                color="primary" 
                                sx={{ mr: 0.5 }} 
                              />
                            ))}
                          </>
                        }
                        secondary={request.description.substring(0, 60) + '...'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending help requests at the moment.
                </Typography>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                href="/ngo/help-requests"
              >
                View All Help Requests
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Quick Actions" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth
                href="/ngo/resources/add"
                startIcon={<InventoryIcon />}
              >
                Add Resource
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth
                href="/ngo/volunteers"
                startIcon={<PeopleIcon />}
              >
                Manage Volunteers
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth
                href="/ngo/help-requests/assigned"
                startIcon={<HelpIcon />}
              >
                View Assigned Requests
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth
                href="/ngo/map"
                startIcon={<MapIcon />}
              >
                View Map
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
