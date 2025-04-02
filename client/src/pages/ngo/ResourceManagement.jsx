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
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../../context/AuthContext';

export default function ResourceManagement() {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    quantity: '',
    unit: '',
    location: {
      coordinates: [0, 0]
    },
    isAvailable: true
  });

  const resourceTypes = [
    'Food',
    'Water',
    'Medical Supplies',
    'Shelter',
    'Clothing',
    'Transportation',
    'Communication',
    'Other'
  ];

  const unitTypes = [
    'kg',
    'liters',
    'units',
    'boxes',
    'packets',
    'people',
    'vehicles',
    'sets'
  ];

  useEffect(() => {
    fetchResources();
  }, [user._id]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/resources/ngo/${user._id}`);
      setResources(response.data.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources. Please try again later.');
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

  const handleAddDialogOpen = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      quantity: '',
      unit: '',
      location: {
        coordinates: [0, 0]
      },
      isAvailable: true
    });
    setOpenAddDialog(true);
  };

  const handleEditDialogOpen = (resource) => {
    setCurrentResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      description: resource.description,
      quantity: resource.quantity,
      unit: resource.unit,
      location: {
        coordinates: resource.location.coordinates
      },
      isAvailable: resource.isAvailable
    });
    setOpenEditDialog(true);
  };

  const handleDeleteDialogOpen = (resource) => {
    setCurrentResource(resource);
    setOpenDeleteDialog(true);
  };

  const handleDialogClose = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentResource(null);
  };

  const handleAddResource = async () => {
    try {
      setError('');
      const resourceData = {
        ...formData,
        providedBy: user._id
      };
      
      await axios.post('/resources', resourceData);
      handleDialogClose();
      fetchResources();
    } catch (error) {
      console.error('Error adding resource:', error);
      setError('Failed to add resource. Please try again.');
    }
  };

  const handleEditResource = async () => {
    try {
      setError('');
      await axios.put(`/resources/${currentResource._id}`, formData);
      handleDialogClose();
      fetchResources();
    } catch (error) {
      console.error('Error updating resource:', error);
      setError('Failed to update resource. Please try again.');
    }
  };

  const handleDeleteResource = async () => {
    try {
      setError('');
      await axios.delete(`/resources/${currentResource._id}`);
      handleDialogClose();
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError('Failed to delete resource. Please try again.');
    }
  };

  const handleToggleAvailability = async (resource) => {
    try {
      setError('');
      await axios.put(`/resources/${resource._id}/availability`, {
        isAvailable: !resource.isAvailable
      });
      fetchResources();
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError('Failed to update resource availability. Please try again.');
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
          Resource Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Add Resource
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.length > 0 ? (
              resources.map((resource) => (
                <TableRow key={resource._id}>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell>{resource.type}</TableCell>
                  <TableCell>{resource.quantity} {resource.unit}</TableCell>
                  <TableCell>
                    <Chip 
                      label={resource.isAvailable ? 'Available' : 'Unavailable'} 
                      color={resource.isAvailable ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditDialogOpen(resource)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteDialogOpen(resource)}>
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleToggleAvailability(resource)}
                    >
                      {resource.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No resources found. Add some resources to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Resource Dialog */}
      <Dialog open={openAddDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Resource Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Resource Type"
                >
                  {resourceTypes.map((type) => (
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
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  label="Unit"
                >
                  {unitTypes.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddResource} variant="contained">Add Resource</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={openEditDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Resource Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Resource Type"
                >
                  {resourceTypes.map((type) => (
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
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  label="Unit"
                >
                  {unitTypes.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleEditResource} variant="contained">Update Resource</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Resource Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDialogClose}>
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this resource? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteResource} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
