import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AuthContext from '../../context/AuthContext';

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'AffectedIndividual',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    // NGO specific fields
    ngoDetails: {
      registrationNumber: '',
      description: '',
      website: '',
      foundedYear: ''
    },
    // Volunteer specific fields
    volunteerDetails: {
      skills: '',
      availability: 'Emergency-only'
    },
    // Affected individual specific fields
    affectedDetails: {
      familySize: 1,
      currentNeeds: '',
      medicalConditions: ''
    }
  });
  const [error, setError] = useState('');
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const steps = ['Basic Information', 'Role-specific Details', 'Review'];

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

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic information
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Prepare data based on role
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      };
      
      // Add role-specific details
      if (formData.role === 'NGO') {
        userData.ngoDetails = formData.ngoDetails;
      } else if (formData.role === 'Volunteer') {
        userData.volunteerDetails = {
          ...formData.volunteerDetails,
          skills: formData.volunteerDetails.skills.split(',').map(skill => skill.trim())
        };
      } else if (formData.role === 'AffectedIndividual') {
        userData.affectedDetails = {
          ...formData.affectedDetails,
          currentNeeds: formData.affectedDetails.currentNeeds.split(',').map(need => need.trim()),
          medicalConditions: formData.affectedDetails.medicalConditions.split(',').map(condition => condition.trim())
        };
      }
      
      const result = await register(userData);
      
      if (result && result.success) {
        // Redirect based on user role
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          if ((user.role === 'NGO' || user.role === 'Volunteer') && !user.isVerified) {
            // Show pending verification message
            navigate('/verification-pending');
          } else {
            const role = user.role.toLowerCase();
            navigate(`/${role}`);
          }
        } else {
          navigate('/');
        }
      } else {
        setError(result?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error?.message || 'Registration failed. Please try again.');
    }
  };

  // Render basic information form
  const renderBasicInfoForm = () => (
    <>
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={formData.name}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          id="role"
          name="role"
          value={formData.role}
          label="Role"
          onChange={handleChange}
        >
          <MenuItem value="AffectedIndividual">Affected Individual</MenuItem>
          <MenuItem value="Volunteer">Volunteer</MenuItem>
          <MenuItem value="NGO">NGO</MenuItem>
        </Select>
      </FormControl>
      <TextField
        margin="normal"
        fullWidth
        id="phone"
        label="Phone Number"
        name="phone"
        autoComplete="tel"
        value={formData.phone}
        onChange={handleChange}
      />
    </>
  );

  // Render role-specific form
  const renderRoleSpecificForm = () => {
    if (formData.role === 'NGO') {
      return (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            id="ngoDetails.registrationNumber"
            label="NGO Registration Number"
            name="ngoDetails.registrationNumber"
            value={formData.ngoDetails.registrationNumber}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="ngoDetails.description"
            label="NGO Description"
            name="ngoDetails.description"
            multiline
            rows={3}
            value={formData.ngoDetails.description}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="ngoDetails.website"
            label="NGO Website"
            name="ngoDetails.website"
            value={formData.ngoDetails.website}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="ngoDetails.foundedYear"
            label="Year Founded"
            name="ngoDetails.foundedYear"
            type="number"
            value={formData.ngoDetails.foundedYear}
            onChange={handleChange}
          />
        </>
      );
    } else if (formData.role === 'Volunteer') {
      return (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            id="volunteerDetails.skills"
            label="Skills (comma-separated)"
            name="volunteerDetails.skills"
            helperText="E.g., First Aid, Driving, Cooking"
            value={formData.volunteerDetails.skills}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="availability-label">Availability</InputLabel>
            <Select
              labelId="availability-label"
              id="volunteerDetails.availability"
              name="volunteerDetails.availability"
              value={formData.volunteerDetails.availability}
              label="Availability"
              onChange={handleChange}
            >
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Weekends">Weekends</MenuItem>
              <MenuItem value="Emergency-only">Emergency-only</MenuItem>
            </Select>
          </FormControl>
        </>
      );
    } else if (formData.role === 'AffectedIndividual') {
      return (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            id="affectedDetails.familySize"
            label="Family Size"
            name="affectedDetails.familySize"
            type="number"
            value={formData.affectedDetails.familySize}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="affectedDetails.currentNeeds"
            label="Current Needs (comma-separated)"
            name="affectedDetails.currentNeeds"
            helperText="E.g., Food, Shelter, Medical"
            value={formData.affectedDetails.currentNeeds}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="affectedDetails.medicalConditions"
            label="Medical Conditions (comma-separated)"
            name="affectedDetails.medicalConditions"
            helperText="E.g., Diabetes, Asthma"
            value={formData.affectedDetails.medicalConditions}
            onChange={handleChange}
          />
        </>
      );
    }
    
    return null;
  };

  // Render address form (common for all roles)
  const renderAddressForm = () => (
    <>
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Address Information
      </Typography>
      <TextField
        margin="normal"
        fullWidth
        id="address.street"
        label="Street Address"
        name="address.street"
        value={formData.address.street}
        onChange={handleChange}
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            margin="normal"
            fullWidth
            id="address.city"
            label="City"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            margin="normal"
            fullWidth
            id="address.state"
            label="State"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            margin="normal"
            fullWidth
            id="address.pincode"
            label="Pincode"
            name="address.pincode"
            value={formData.address.pincode}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            margin="normal"
            fullWidth
            id="address.country"
            label="Country"
            name="address.country"
            value={formData.address.country}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </>
  );

  // Render review information
  const renderReview = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Basic Information</Typography>
      <Typography>Name: {formData.name}</Typography>
      <Typography>Email: {formData.email}</Typography>
      <Typography>Role: {formData.role}</Typography>
      <Typography>Phone: {formData.phone || 'Not provided'}</Typography>
      
      <Typography variant="h6" sx={{ mt: 2 }}>Address</Typography>
      <Typography>
        {formData.address.street && `${formData.address.street}, `}
        {formData.address.city && `${formData.address.city}, `}
        {formData.address.state && `${formData.address.state}, `}
        {formData.address.pincode && `${formData.address.pincode}, `}
        {formData.address.country}
      </Typography>
      
      {formData.role === 'NGO' && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>NGO Details</Typography>
          <Typography>Registration Number: {formData.ngoDetails.registrationNumber}</Typography>
          <Typography>Description: {formData.ngoDetails.description}</Typography>
          <Typography>Website: {formData.ngoDetails.website || 'Not provided'}</Typography>
          <Typography>Founded Year: {formData.ngoDetails.foundedYear || 'Not provided'}</Typography>
        </>
      )}
      
      {formData.role === 'Volunteer' && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>Volunteer Details</Typography>
          <Typography>Skills: {formData.volunteerDetails.skills}</Typography>
          <Typography>Availability: {formData.volunteerDetails.availability}</Typography>
        </>
      )}
      
      {formData.role === 'AffectedIndividual' && (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>Affected Individual Details</Typography>
          <Typography>Family Size: {formData.affectedDetails.familySize}</Typography>
          <Typography>Current Needs: {formData.affectedDetails.currentNeeds || 'Not provided'}</Typography>
          <Typography>Medical Conditions: {formData.affectedDetails.medicalConditions || 'Not provided'}</Typography>
        </>
      )}
    </Box>
  );

  // Render form based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            {renderBasicInfoForm()}
          </>
        );
      case 1:
        return (
          <>
            {renderRoleSpecificForm()}
            {renderAddressForm()}
          </>
        );
      case 2:
        return renderReview();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Disaster Relief Platform
          </Typography>
          <Typography component="h2" variant="h6" sx={{ mt: 1 }}>
            Sign Up
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ width: '100%', mt: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
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
          
          <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Grid item>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
