import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Switch,
  FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AuthContext from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';
import DisasterMap from '../../components/map/DisasterMap';

export default function DisasterManagement() {
  const { user } = useContext(AuthContext);
  const { sendDisasterAlert } = useContext(SocketContext);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [currentDisaster, setCurrentDisaster] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    severity: 'Medium',
    location: {
      coordinates: [0, 0]
    },
    isActive: true,
    alertMessage: ''
  });

  const disasterTypes = [
    'Earthquake',
    'Flood',
    'Hurricane',
    'Tornado',
    'Wildfire',
    'Landslide',
    'Tsunami',
    'Drought',
    'Epidemic',
    'Industrial Accident',
    'Other'
  ];

  const severityLevels = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/disasters');
      setDisasters(response.data.data);
    } catch (error) {
      console.error('Error fetching disasters:', error);
      setError('Failed to load disasters. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
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

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    const index = name === 'longitude' ? 0 : 1;
    const newCoordinates = [...formData.location.coordinates];
    newCoordinates[index] = parseFloat(value);
    
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        coordinates: newCoordinates
      }
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleAddDialogOpen = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      severity: 'Medium',
      location: {
        coordinates: [0, 0]
      },
      isActive: true,
      alertMessage: ''
    });
    setOpenAddDialog(true);
  };

  const handleEditDialogOpen = (disaster) => {
    setCurrentDisaster(disaster);
    setFormData({
      name: disaster.name,
      type: disaster.type,
      description: disaster.description,
      severity: disaster.severity,
      location: {
        coordinates: disaster.location.coordinates
      },
      isActive: disaster.isActive,
      alertMessage: disaster.alertMessage || ''
    });
    setOpenEditDialog(true);
  };

  const handleDeleteDialogOpen = (disaster) => {
    setCurrentDisaster(disaster);
    setOpenDeleteDialog(true);
  };

  const handleAlertDialogOpen = (disaster) => {
    setCurrentDisaster(disaster);
    setAlertMessage(disaster.alertMessage || `${disaster.severity} ${disaster.type} alert: ${disaster.name}. Please take necessary precautions.`);
    setOpenAlertDialog(true);
  };

  const handleDialogClose = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setOpenAlertDialog(false);
    setCurrentDisaster(null);
    setAlertMessage('');
  };

  const handleAddDisaster = async () => {
    try {
      setError('');
      await axios.post('/disasters', formData);
      handleDialogClose();
      fetchDisasters();
    } catch (error) {
      console.error('Error adding disaster:', error);
      setError('Failed to add disaster. Please try again.');
    }
  };

  const handleEditDisaster = async () => {
    try {
      setError('');
      await axios.put(`/disasters/${currentDisaster._id}`, formData);
      handleDialogClose();
      fetchDisasters();
    } catch (error) {
      console.error('Error updating disaster:', error);
      setError('Failed to update disaster. Please try again.');
    }
  };

  const handleDeleteDisaster = async () => {
    try {
      setError('');
      await axios.delete(`/disasters/${currentDisaster._id}`);
      handleDialogClose();
      fetchDisasters();
    } catch (error) {
      console.error('Error deleting disaster:', error);
      setError('Failed to delete disaster. Please try again.');
    }
  };

  const handleToggleActive = async (disaster) => {
    try {
      setError('');
      await axios.put(`/disasters/${disaster._id}/status`, {
        isActive: !disaster.isActive
      });
      fetchDisasters();
    } catch (error) {
      console.error('Error toggling disaster status:', error);
      setError('Failed to update disaster status. Please try again.');
    }
  };

  const handleSendAlert = async () => {
    try {
      setError('');
      // Update alert message in database
      await axios.put(`/disasters/${currentDisaster._id}/alert`, {
        alertMessage: alertMessage
      });
      
      // Send real-time alert via socket
      const alertData = {
        id: Date.now().toString(),
        title: `${currentDisaster.severity} ${currentDisaster.type} Alert`,
        message: alertMessage,
        disasterId: currentDisaster._id,
        timestamp: new Date().toISOString()
      };
      
      const sent = sendDisasterAlert(alertData);
      
      if (sent) {
        handleDialogClose();
        fetchDisasters();
      } else {
        setError('Failed to send alert. Socket connection issue.');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      setError('Failed to send alert. Please try again.');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'info';
      case 'High':
        return 'warning';
      case 'Critical':
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Disaster Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Add Disaster
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Map View */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Disaster Map
          </Typography>
          <Box sx={{ height: '400px', width: '100%', mt: 2 }}>
            <DisasterMap
              disasters={disasters.filter(d => d.isActive)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Table View */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {disasters.length > 0 ? (
              disasters.map((disaster) => (
                <TableRow key={disaster._id}>
                  <TableCell>{disaster.name}</TableCell>
                  <TableCell>{disaster.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={disaster.severity} 
                      color={getSeverityColor(disaster.severity)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={disaster.isActive}
                          onChange={() => handleToggleActive(disaster)}
                          color={disaster.isActive ? 'success' : 'default'}
                        />
                      }
                      label={disaster.isActive ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditDialogOpen(disaster)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteDialogOpen(disaster)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleAlertDialogOpen(disaster)}
                      color="warning"
                      disabled={!disaster.isActive}
                    >
                      <NotificationsIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No disasters found. Add some disasters to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Disaster Dialog */}
      <Dialog open={openAddDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Disaster</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Disaster Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Disaster Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Disaster Type"
                >
                  {disasterTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Severity</InputLabel>
                <Select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  label="Severity"
                >
                  {severityLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                    color="success"
                  />
                }
                label="Active Disaster"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="longitude"
                label="Longitude"
                type="number"
                fullWidth
                value={formData.location.coordinates[0]}
                onChange={handleLocationChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="latitude"
                label="Latitude"
                type="number"
                fullWidth
                value={formData.location.coordinates[1]}
                onChange={handleLocationChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="alertMessage"
                label="Default Alert Message"
                fullWidth
                multiline
                rows={2}
                value={formData.alertMessage}
                onChange={handleInputChange}
                placeholder="This message will be used when sending alerts about this disaster"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddDisaster} variant="contained">Add Disaster</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Disaster Dialog */}
      <Dialog open={openEditDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Disaster</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Disaster Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Disaster Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Disaster Type"
                >
                  {disasterTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Severity</InputLabel>
                <Select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  label="Severity"
                >
                  {severityLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                    color="success"
                  />
                }
                label="Active Disaster"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="longitude"
                label="Longitude"
                type="number"
                fullWidth
                value={formData.location.coordinates[0]}
                onChange={handleLocationChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="latitude"
                label="Latitude"
                type="number"
                fullWidth
                value={formData.location.coordinates[1]}
                onChange={handleLocationChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="alertMessage"
                label="Default Alert Message"
                fullWidth
                multiline
                rows={2}
                value={formData.alertMessage}
                onChange={handleInputChange}
                placeholder="This message will be used when sending alerts about this disaster"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleEditDisaster} variant="contained">Update Disaster</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Disaster Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDialogClose}>
        <DialogTitle>Delete Disaster</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this disaster? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteDisaster} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Send Alert Dialog */}
      <Dialog open={openAlertDialog} onClose={handleDialogClose}>
        <DialogTitle>Send Disaster Alert</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will send a real-time alert to all users about this disaster.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            label="Alert Message"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSendAlert} 
            color="warning" 
            variant="contained"
            startIcon={<NotificationsIcon />}
          >
            Send Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
