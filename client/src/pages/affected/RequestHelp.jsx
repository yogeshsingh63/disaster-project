import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Checkbox,
  FormGroup,
  FormControlLabel,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SosIcon from '@mui/icons-material/Sos';
import AuthContext from '../../context/AuthContext';
import DisasterMap from '../../components/map/DisasterMap';

export default function RequestHelp() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    requestType: [],
    description: '',
    numberOfPeople: 1,
    medicalEmergency: false,
    specialNeeds: '',
    location: {
      coordinates: [0, 0]
    }
  });

  const requestTypes = [
    'Food',
    'Water',
    'Medical',
    'Shelter',
    'Evacuation',
    'Rescue',
    'Other'
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([latitude, longitude]);
          setFormData(prev => ({
            ...prev,
            location: {
              coordinates: [longitude, latitude]
            }
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to access your location. Please enter your location manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter your location manually.');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleRequestTypeChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      requestType: value
    });
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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const helpRequestData = {
        ...formData,
        requestedBy: user._id,
        status: 'Pending'
      };
      
      const response = await axios.post('/help-requests', helpRequestData);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/affected/my-requests');
        }, 3000);
      } else {
        setError('Failed to submit help request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting help request:', error);
      setError(error.response?.data?.message || 'Failed to submit help request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Request Details', 'Location Information', 'Review & Submit'];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Request Type</InputLabel>
                <Select
                  multiple
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleRequestTypeChange}
                  label="Request Type"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {requestTypes.map((type) => (
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
                label="Describe your situation"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Please provide details about your emergency situation"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="numberOfPeople"
                label="Number of People"
                type="number"
                fullWidth
                value={formData.numberOfPeople}
                onChange={handleInputChange}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.medicalEmergency}
                      onChange={handleCheckboxChange}
                      name="medicalEmergency"
                      color="error"
                    />
                  }
                  label="This is a medical emergency"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="specialNeeds"
                label="Special Needs or Requirements"
                fullWidth
                multiline
                rows={2}
                value={formData.specialNeeds}
                onChange={handleInputChange}
                placeholder="Any special needs, disabilities, or medical conditions"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Your current location has been automatically detected. You can adjust it if needed.
              </Typography>
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
              <Box sx={{ height: '400px', width: '100%', mt: 2 }}>
                {location && (
                  <DisasterMap
                    center={[location[0], location[1]]}
                    zoom={13}
                    helpRequests={[
                      {
                        _id: 'preview',
                        location: {
                          coordinates: [formData.location.coordinates[0], formData.location.coordinates[1]].reverse()
                        },
                        description: formData.description,
                        requestType: formData.requestType,
                        numberOfPeople: formData.numberOfPeople,
                        status: 'Preview'
                      }
                    ]}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                startIcon={<LocationOnIcon />}
                variant="outlined"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation([latitude, longitude]);
                        setFormData(prev => ({
                          ...prev,
                          location: {
                            coordinates: [longitude, latitude]
                          }
                        }));
                      },
                      (error) => {
                        console.error('Geolocation error:', error);
                        setError('Unable to access your location. Please enter your location manually.');
                      }
                    );
                  }
                }}
              >
                Update to Current Location
              </Button>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Your Help Request
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Request Type:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.requestType.join(', ')}
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Description:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.description}
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Number of People:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.numberOfPeople}
                </Typography>
                
                {formData.medicalEmergency && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, color: 'error.main' }}>
                      Medical Emergency:
                    </Typography>
                    <Typography variant="body1" gutterBottom color="error">
                      Yes - This request will be prioritized
                    </Typography>
                  </>
                )}
                
                {formData.specialNeeds && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Special Needs:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.specialNeeds}
                    </Typography>
                  </>
                )}
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Location:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Longitude: {formData.location.coordinates[0]}, Latitude: {formData.location.coordinates[1]}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  if (success) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your help request has been submitted successfully! You will be redirected to your requests page.
        </Alert>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Request Help
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={<SosIcon />}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Help Request'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
