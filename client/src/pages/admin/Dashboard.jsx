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
  Alert
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import InventoryIcon from '@mui/icons-material/Inventory';
import HelpIcon from '@mui/icons-material/Help';
import AuthContext from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    users: { total: 0, pending: 0 },
    disasters: { total: 0, active: 0 },
    resources: { total: 0 },
    helpRequests: { total: 0, pending: 0 }
  });
  const [recentDisasters, setRecentDisasters] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch users stats
        const usersResponse = await axios.get('/users');
        const pendingUsersResponse = await axios.get('/users/unverified');
        
        // Fetch disasters stats
        const disastersResponse = await axios.get('/disasters');
        const activeDisastersResponse = await axios.get('/disasters/active');
        
        // Fetch resources stats
        const resourcesResponse = await axios.get('/resources');
        
        // Fetch help requests stats
        const helpRequestsResponse = await axios.get('/help-requests');
        const pendingHelpRequestsResponse = await axios.get('/help-requests/status/Pending');

        // Update stats
        setStats({
          users: {
            total: usersResponse.data.count,
            pending: pendingUsersResponse.data.count
          },
          disasters: {
            total: disastersResponse.data.count,
            active: activeDisastersResponse.data.count
          },
          resources: {
            total: resourcesResponse.data.count
          },
          helpRequests: {
            total: helpRequestsResponse.data.count,
            pending: pendingHelpRequestsResponse.data.count
          }
        });

        // Set recent disasters
        setRecentDisasters(activeDisastersResponse.data.data.slice(0, 5));
        
        // Set pending users
        setPendingUsers(pendingUsersResponse.data.data.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleVerifyUser = async (userId) => {
    try {
      await axios.put(`/users/verify/${userId}`);
      
      // Update pending users list
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        users: {
          ...prevStats.users,
          pending: prevStats.users.pending - 1
        }
      }));
    } catch (error) {
      console.error('Error verifying user:', error);
      setError('Failed to verify user. Please try again.');
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
        Admin Dashboard
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
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Users</Typography>
              </Box>
              <Typography variant="h4">{stats.users.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.users.pending} pending verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <WarningIcon />
                </Avatar>
                <Typography variant="h6">Disasters</Typography>
              </Box>
              <Typography variant="h4">{stats.disasters.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.disasters.active} active disasters
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
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
                Available for distribution
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
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
                {stats.helpRequests.pending} pending requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Disasters and Pending Verifications */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Active Disasters" />
            <Divider />
            <CardContent>
              {recentDisasters.length > 0 ? (
                <List>
                  {recentDisasters.map((disaster) => (
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
                href="/admin/disasters"
              >
                View All Disasters
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Pending Verifications" />
            <Divider />
            <CardContent>
              {pendingUsers.length > 0 ? (
                <List>
                  {pendingUsers.map((user) => (
                    <ListItem 
                      key={user._id}
                      secondaryAction={
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleVerifyUser(user._id)}
                        >
                          Verify
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {user.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={`${user.role} - ${user.email}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending verifications at the moment.
                </Typography>
              )}
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                href="/admin/users"
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
