import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import AuthContext from '../../context/AuthContext';

export default function MyRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, [user._id]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      // In a real app, this would fetch from the API
      // const response = await axios.get(`/help-requests/user/${user._id}`);
      
      // For now, using mock data
      const mockRequests = [
        {
          _id: '1',
          requestType: ['Food', 'Water'],
          description: 'Need urgent food and water supplies for a family of 5',
          numberOfPeople: 5,
          medicalEmergency: false,
          specialNeeds: 'Have an elderly person with mobility issues',
          location: {
            coordinates: [77.2090, 28.6139] // Delhi
          },
          status: 'Pending',
          requestedBy: user._id,
          createdAt: new Date('2025-03-25').toISOString(),
          updatedAt: new Date('2025-03-25').toISOString()
        },
        {
          _id: '2',
          requestType: ['Medical', 'Evacuation'],
          description: 'Medical emergency - need evacuation and medical supplies',
          numberOfPeople: 2,
          medicalEmergency: true,
          specialNeeds: 'Person with diabetes needs insulin',
          location: {
            coordinates: [77.2090, 28.6139] // Delhi
          },
          status: 'Assigned',
          assignedTo: {
            ngo: 'NGO123',
            volunteer: 'Volunteer456'
          },
          requestedBy: user._id,
          createdAt: new Date('2025-03-26').toISOString(),
          updatedAt: new Date('2025-03-27').toISOString()
        },
        {
          _id: '3',
          requestType: ['Shelter'],
          description: 'Need temporary shelter as house is flooded',
          numberOfPeople: 3,
          medicalEmergency: false,
          specialNeeds: '',
          location: {
            coordinates: [77.2090, 28.6139] // Delhi
          },
          status: 'Resolved',
          assignedTo: {
            ngo: 'NGO789'
          },
          requestedBy: user._id,
          createdAt: new Date('2025-03-20').toISOString(),
          updatedAt: new Date('2025-03-22').toISOString()
        }
      ];
      
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching help requests:', error);
      setError('Failed to load your help requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDialogOpen = (request) => {
    setCurrentRequest(request);
    setOpenViewDialog(true);
  };

  const handleCancelDialogOpen = (request) => {
    setCurrentRequest(request);
    setOpenCancelDialog(true);
  };

  const handleDialogClose = () => {
    setOpenViewDialog(false);
    setOpenCancelDialog(false);
    setCurrentRequest(null);
  };

  const handleCancelRequest = async () => {
    try {
      setError('');
      // In a real app, this would call the API
      // await axios.put(`/help-requests/${currentRequest._id}/cancel`);
      
      // Update local state
      setRequests(requests.map(request => {
        if (request._id === currentRequest._id) {
          return { ...request, status: 'Cancelled' };
        }
        return request;
      }));
      
      handleDialogClose();
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

  const filteredRequests = () => {
    switch (tabValue) {
      case 0: // All Requests
        return requests;
      case 1: // Active Requests
        return requests.filter(request => 
          ['Pending', 'Assigned', 'In Progress'].includes(request.status)
        );
      case 2: // Resolved Requests
        return requests.filter(request => request.status === 'Resolved');
      case 3: // Cancelled Requests
        return requests.filter(request => request.status === 'Cancelled');
      default:
        return requests;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="h4" gutterBottom>
        My Help Requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/affected/request-help"
          sx={{ mb: { xs: 2, sm: 0 } }}
        >
          Create New Help Request
        </Button>
      </Box>

      <Box sx={{ width: '100%', mb: 3, overflowX: 'auto' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="request filter tabs"
        >
          <Tab label="All Requests" />
          <Tab label="Active Requests" />
          <Tab label="Resolved Requests" />
          <Tab label="Cancelled Requests" />
        </Tabs>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests().length > 0 ? (
              filteredRequests().map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {request.requestType.map((type) => (
                        <Chip 
                          key={type} 
                          label={type} 
                          size="small" 
                          color="primary" 
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                      {request.medicalEmergency && (
                        <Chip 
                          label="Medical Emergency" 
                          size="small" 
                          color="error" 
                          sx={{ mb: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: { xs: 120, sm: 200, md: 300 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {request.description.length > 60 ? `${request.description.substring(0, 60)}...` : request.description}
                  </TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      color={getStatusColor(request.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton 
                      onClick={() => handleViewDialogOpen(request)}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {request.status === 'Pending' && (
                      <IconButton 
                        onClick={() => handleCancelDialogOpen(request)}
                        color="error"
                        size="small"
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No help requests found in this category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Request Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Help Request Details</DialogTitle>
        <DialogContent dividers>
          {currentRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Request Type:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {currentRequest.requestType.map((type) => (
                    <Chip 
                      key={type} 
                      label={type} 
                      color="primary" 
                    />
                  ))}
                  {currentRequest.medicalEmergency && (
                    <Chip 
                      label="Medical Emergency" 
                      color="error" 
                    />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1">Description:</Typography>
                <Typography variant="body1" paragraph>
                  {currentRequest.description}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Number of People:</Typography>
                <Typography variant="body1" paragraph>
                  {currentRequest.numberOfPeople}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Status:</Typography>
                <Chip 
                  label={currentRequest.status} 
                  color={getStatusColor(currentRequest.status)} 
                />
              </Grid>
              
              {currentRequest.specialNeeds && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Special Needs:</Typography>
                  <Typography variant="body1" paragraph>
                    {currentRequest.specialNeeds}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Created:</Typography>
                <Typography variant="body1" paragraph>
                  {formatDate(currentRequest.createdAt)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Last Updated:</Typography>
                <Typography variant="body1" paragraph>
                  {formatDate(currentRequest.updatedAt)}
                </Typography>
              </Grid>
              
              {currentRequest.assignedTo && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Assigned To:</Typography>
                  <Typography variant="body1" paragraph>
                    {currentRequest.assignedTo.ngo && `NGO ID: ${currentRequest.assignedTo.ngo}`}
                    {currentRequest.assignedTo.volunteer && `, Volunteer ID: ${currentRequest.assignedTo.volunteer}`}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
          {currentRequest && currentRequest.status === 'Pending' && (
            <Button 
              onClick={() => {
                handleDialogClose();
                handleCancelDialogOpen(currentRequest);
              }} 
              color="error"
            >
              Cancel Request
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Cancel Request Dialog */}
      <Dialog open={openCancelDialog} onClose={handleDialogClose}>
        <DialogTitle>Cancel Help Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this help request? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>No, Keep Request</Button>
          <Button onClick={handleCancelRequest} color="error" variant="contained">
            Yes, Cancel Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
