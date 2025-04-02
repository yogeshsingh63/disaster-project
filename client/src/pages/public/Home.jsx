import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Container,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Fade
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArticleIcon from '@mui/icons-material/Article';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import DisasterMap from '../../components/map/DisasterMap';

// Disaster relief image slides
const disasterReliefImages = [
  {
    url: 'https://images.pexels.com/photos/4604579/pexels-photo-4604579.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Emergency Rescue Operations',
    description: 'Rescue teams evacuating affected people from flood disaster areas'
  },
  {
    url: 'https://images.pexels.com/photos/6591165/pexels-photo-6591165.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Medical Relief Services',
    description: 'Healthcare professionals providing essential medical care to disaster victims'
  },
  {
    url: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Community Reconstruction',
    description: 'Volunteers helping rebuild homes and infrastructure in affected communities'
  },
  {
    url: 'https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Food and Supply Distribution',
    description: 'Volunteers distributing essential supplies to disaster survivors'
  }
];

// Mock data for development - in production, this would come from APIs
const mockDisasters = [
  {
    _id: '1',
    name: 'Cyclone Amphan',
    type: 'Cyclone',
    severity: 'High',
    description: 'Super Cyclone Amphan is affecting coastal areas of Eastern India',
    location: { coordinates: [88.3639, 22.5726] }, // Kolkata
    isActive: true,
    alertMessage: 'Cyclone Amphan approaching Eastern coast. Take necessary precautions.'
  },
  {
    _id: '2',
    name: 'Kerala Floods',
    type: 'Flood',
    severity: 'Critical',
    description: 'Heavy rainfall causing severe flooding in Kerala',
    location: { coordinates: [76.2711, 10.8505] }, // Kerala
    isActive: true,
    alertMessage: 'Severe flooding in Kerala. Avoid travel to affected areas.'
  },
  {
    _id: '3',
    name: 'Maharashtra Drought',
    type: 'Drought',
    severity: 'Medium',
    description: 'Prolonged drought affecting agricultural regions in Maharashtra',
    location: { coordinates: [75.7139, 19.7515] }, // Maharashtra
    isActive: true,
    alertMessage: 'Drought conditions persist in Maharashtra. Conserve water.'
  }
];

const mockNews = [
  {
    id: '1',
    title: 'IMD Issues Red Alert for Coastal Tamil Nadu',
    source: 'Indian Meteorological Department',
    date: '2025-03-28',
    summary: 'The Indian Meteorological Department has issued a red alert for coastal Tamil Nadu due to a developing low-pressure system in the Bay of Bengal.',
    image: 'https://images.unsplash.com/photo-1514632595-4944383f2737?q=80&w=500&auto=format&fit=crop',
    url: 'https://mausam.imd.gov.in/'
  },
  {
    id: '2',
    title: 'NDRF Teams Deployed in Flood-Affected Areas of Assam',
    source: 'National Disaster Response Force',
    date: '2025-03-27',
    summary: 'The National Disaster Response Force (NDRF) has deployed 10 teams to flood-affected areas in Assam to assist with evacuation and relief operations.',
    image: 'https://images.unsplash.com/photo-1618624957832-9b768312ee05?q=80&w=500&auto=format&fit=crop',
    url: 'https://ndrf.gov.in/'
  },
  {
    id: '3',
    title: 'Earthquake of Magnitude 4.2 Hits Uttarakhand',
    source: 'National Center for Seismology',
    date: '2025-03-26',
    summary: 'An earthquake of magnitude 4.2 on the Richter scale hit Uttarakhand on Wednesday morning. No casualties or major damage reported.',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=500&auto=format&fit=crop',
    url: 'https://seismo.gov.in/'
  },
  {
    id: '4',
    title: 'Heatwave Conditions to Persist in Northern India',
    source: 'Indian Meteorological Department',
    date: '2025-03-25',
    summary: 'The IMD has predicted that heatwave conditions will persist in northern India for the next 5 days with temperatures likely to cross 45°C in some regions.',
    image: 'https://images.unsplash.com/photo-1599047959776-32b2e1b7b905?q=80&w=500&auto=format&fit=crop',
    url: 'https://mausam.imd.gov.in/'
  }
];

const mockWarnings = [
  {
    id: '1',
    type: 'Cyclone',
    area: 'Eastern Coast - Odisha, West Bengal',
    severity: 'High',
    message: 'Cyclonic storm forming in Bay of Bengal, expected to make landfall within 48 hours.',
    date: '2025-03-28',
    source: 'IMD'
  },
  {
    id: '2',
    type: 'Flood',
    area: 'Brahmaputra Valley - Assam',
    severity: 'Critical',
    message: 'River water levels rising rapidly. Immediate evacuation advised for low-lying areas.',
    date: '2025-03-28',
    source: 'CWC'
  },
  {
    id: '3',
    type: 'Heatwave',
    area: 'Northern Plains - Delhi, Haryana, Punjab, UP',
    severity: 'Medium',
    message: 'Severe heatwave conditions expected to continue. Avoid outdoor activities between 11 AM and 4 PM.',
    date: '2025-03-27',
    source: 'IMD'
  },
  {
    id: '4',
    type: 'Landslide',
    area: 'Himalayan Region - Himachal Pradesh, Uttarakhand',
    severity: 'Medium',
    message: 'Heavy rainfall increasing risk of landslides. Avoid travel on mountain roads.',
    date: '2025-03-26',
    source: 'GSI'
  }
];

const mockAffectedAreas = [
  {
    id: '1',
    name: 'Odisha Coastal Districts',
    type: 'Cyclone',
    population: '2.3 million',
    status: 'Evacuation in progress',
    needs: 'Shelter, Food, Medical Aid'
  },
  {
    id: '2',
    name: 'Assam Flood Plains',
    type: 'Flood',
    population: '1.5 million',
    status: 'Relief camps established',
    needs: 'Clean Water, Food, Medicine'
  },
  {
    id: '3',
    name: 'Vidarbha Region, Maharashtra',
    type: 'Drought',
    population: '3.2 million',
    status: 'Water supply limited',
    needs: 'Drinking Water, Food Security'
  },
  {
    id: '4',
    name: 'Coastal Kerala',
    type: 'Flood',
    population: '0.8 million',
    status: 'Rescue operations ongoing',
    needs: 'Boats, Food, Medical Teams'
  }
];

export default function Home() {
  const [activeImage, setActiveImage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [disasters, setDisasters] = useState(mockDisasters);
  const [news, setNews] = useState(mockNews);
  const [warnings, setWarnings] = useState(mockWarnings);
  const [affectedAreas, setAffectedAreas] = useState(mockAffectedAreas);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeMode, setFadeMode] = useState(true);
  
  const nextImage = useCallback(() => {
    setFadeMode(false);
    setTimeout(() => {
      setActiveImage((prev) => (prev === disasterReliefImages.length - 1 ? 0 : prev + 1));
      setFadeMode(true);
    }, 400);
  }, []);
  
  const prevImage = useCallback(() => {
    setFadeMode(false);
    setTimeout(() => {
      setActiveImage((prev) => (prev === 0 ? disasterReliefImages.length - 1 : prev - 1));
      setFadeMode(true);
    }, 400);
  }, []);

  const setSpecificImage = useCallback((index) => {
    if (index === activeImage) return;
    setFadeMode(false);
    setTimeout(() => {
      setActiveImage(index);
      setFadeMode(true);
    }, 400);
  }, [activeImage]);

  useEffect(() => {
    // Auto-rotate images
    const timer = setInterval(() => {
      nextImage();
    }, 6000);
    
    return () => clearInterval(timer);
  }, [nextImage]);

  useEffect(() => {
    // In a real application, you would fetch data from APIs here
    // For example:
    // fetchDisasterData();
    // fetchNewsData();
    // fetchWarnings();
    // fetchAffectedAreas();
  }, []);

  // In a real application, you would fetch from actual APIs
  // For now, we'll use our mock data
  const fetchDisasterData = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from actual APIs
      // const response = await axios.get('/api/disasters/active');
      // setDisasters(response.data);
      
      // Using mock data for demonstration
      setDisasters(mockDisasters);
    } catch (error) {
      console.error('Error fetching disaster data:', error);
      setError('Failed to load disaster data. Using sample data instead.');
      setDisasters(mockDisasters);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  return (
    <Box sx={{ backgroundColor: '#f5f5f5' }}>
      {/* Hero Section with Image Slideshow */}
      <Box 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          height: { xs: '60vh', md: '75vh' },
        }}
      >
        {disasterReliefImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: activeImage === index ? 1 : 0,
              transition: 'opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: activeImage === index ? 1 : 0,
            }}
          >
            <Fade
              in={activeImage === index && fadeMode}
              timeout={{
                enter: 1500,
                exit: 800,
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  sx={{
                    height: '100%',
                    display: 'block',
                    width: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    filter: 'brightness(0.6)',
                    transition: 'transform 8s ease-in-out',
                    transform: activeImage === index ? 'scale(1.05)' : 'scale(1)',
                  }}
                  src={image.url}
                  alt={image.title}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    textAlign: 'center',
                    padding: 4,
                    opacity: fadeMode ? 1 : 0,
                    transition: 'opacity 800ms ease-in-out 200ms',
                  }}
                >
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                      fontWeight: 700,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      transform: fadeMode ? 'translateY(0)' : 'translateY(20px)',
                      opacity: fadeMode ? 1 : 0,
                      transition: 'transform 800ms ease-out, opacity 800ms ease-out',
                    }}
                  >
                    Disaster Management Platform
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                      mb: 4,
                      maxWidth: '800px',
                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                      transform: fadeMode ? 'translateY(0)' : 'translateY(15px)',
                      opacity: fadeMode ? 1 : 0,
                      transition: 'transform 800ms ease-out 200ms, opacity 800ms ease-out 200ms',
                    }}
                  >
                    {image.title}: {image.description}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      flexWrap: 'wrap', 
                      justifyContent: 'center', 
                      transform: fadeMode ? 'translateY(0)' : 'translateY(15px)',
                      opacity: fadeMode ? 1 : 0,
                      transition: 'transform 800ms ease-out 300ms, opacity 800ms ease-out 300ms',
                    }}
                  >
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      component={Link}
                      to="/login"
                      sx={{ 
                        py: 1.5, 
                        px: 3, 
                        fontWeight: 600,
                        transition: 'transform 300ms ease-out, background-color 300ms ease-out',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      size="large"
                      component={Link}
                      to="/register"
                      sx={{ 
                        py: 1.5, 
                        px: 3, 
                        fontWeight: 600,
                        transition: 'transform 300ms ease-out, background-color 300ms ease-out',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                        },
                      }}
                    >
                      Register
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="inherit" 
                      size="large"
                      component={Link}
                      to="/login"
                      startIcon={<NotificationsActiveIcon />}
                      sx={{ 
                        py: 1.5, 
                        px: 3, 
                        fontWeight: 600, 
                        backdropFilter: 'blur(8px)',
                        background: 'rgba(255,255,255,0.1)',
                        transition: 'transform 300ms ease-out, background-color 300ms ease-out',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-3px)',
                        }
                      }}
                    >
                      Request Emergency Help
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Box>
        ))}
        
        {/* Navigation Arrows */}
        <IconButton 
          onClick={prevImage}
          sx={{ 
            position: 'absolute', 
            left: 20, 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 5,
            transition: 'all 300ms ease-out',
            '&:hover': { 
              backgroundColor: 'rgba(0,0,0,0.5)',
              transform: 'translateY(-50%) scale(1.1)',
            }
          }}
        >
          <KeyboardArrowLeft fontSize="large" />
        </IconButton>
        
        <IconButton 
          onClick={nextImage}
          sx={{ 
            position: 'absolute', 
            right: 20, 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 5,
            transition: 'all 300ms ease-out',
            '&:hover': { 
              backgroundColor: 'rgba(0,0,0,0.5)',
              transform: 'translateY(-50%) scale(1.1)',
            }
          }}
        >
          <KeyboardArrowRight fontSize="large" />
        </IconButton>
        
        {/* Dots Navigation */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 0, 
            right: 0, 
            display: 'flex', 
            justifyContent: 'center',
            gap: 1,
            zIndex: 5,
          }}
        >
          {disasterReliefImages.map((_, index) => (
            <Box 
              key={index}
              component="button"
              onClick={() => setSpecificImage(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === activeImage ? 'white' : 'rgba(255,255,255,0.5)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  transform: 'scale(1.2)',
                  backgroundColor: index === activeImage ? 'white' : 'rgba(255,255,255,0.7)',
                }
              }}
            />
          ))}
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {error && (
          <Alert severity="info" sx={{ mb: 3, mt: 3 }}>
            {error}
          </Alert>
        )}

        {/* Active Disasters Map */}
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mt: 2, 
            mb: 3, 
            fontWeight: 700, 
            color: '#212121',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 80,
              height: 4,
              backgroundColor: '#d32f2f',
              borderRadius: 2
            }
          }}
        >
          Active Disasters Map
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 5, 
            p: 0, 
            borderRadius: 2, 
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ height: '500px', width: '100%' }}>
            <DisasterMap
              disasters={disasters}
              center={[20.5937, 78.9629]} // Center of India
              zoom={5}
            />
          </Box>
        </Paper>

        {/* Disaster Warnings */}
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mt: 5, 
            mb: 3, 
            fontWeight: 700, 
            color: '#212121',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 80,
              height: 4,
              backgroundColor: '#d32f2f',
              borderRadius: 2
            }
          }}
        >
          Current Warnings
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 5, 
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <List sx={{ p: 0 }}>
            {warnings.map((warning, index) => (
              <React.Fragment key={warning.id}>
                <ListItem 
                  sx={{ 
                    py: 2.5, 
                    px: 3,
                    borderLeft: '4px solid',
                    borderLeftColor: getSeverityColor(warning.severity) === 'success' ? '#4caf50' :
                                    getSeverityColor(warning.severity) === 'info' ? '#2196f3' :
                                    getSeverityColor(warning.severity) === 'warning' ? '#ff9800' : '#f44336',
                    backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <WarningIcon 
                      sx={{ 
                        color: getSeverityColor(warning.severity) === 'success' ? '#4caf50' :
                               getSeverityColor(warning.severity) === 'info' ? '#2196f3' :
                               getSeverityColor(warning.severity) === 'warning' ? '#ff9800' : '#f44336' 
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                          {warning.type} Warning
                        </Typography>
                        <Chip 
                          label={warning.severity} 
                          size="small"
                          sx={{
                            backgroundColor: getSeverityColor(warning.severity) === 'success' ? 'rgba(76, 175, 80, 0.1)' :
                                            getSeverityColor(warning.severity) === 'info' ? 'rgba(33, 150, 243, 0.1)' :
                                            getSeverityColor(warning.severity) === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            color: getSeverityColor(warning.severity) === 'success' ? '#4caf50' :
                                   getSeverityColor(warning.severity) === 'info' ? '#2196f3' :
                                   getSeverityColor(warning.severity) === 'warning' ? '#ff9800' : '#f44336',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: '#424242', fontWeight: 500, mt: 0.5 }}>
                          {warning.area}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#616161', mt: 0.5 }}>
                          {warning.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#757575', mt: 1, display: 'block' }}>
                          Source: {warning.source} | Issued: {warning.date}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < warnings.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Latest News */}
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mt: 5, 
            mb: 3, 
            fontWeight: 700, 
            color: '#212121',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 80,
              height: 4,
              backgroundColor: '#d32f2f',
              borderRadius: 2
            }
          }}
        >
          Latest News
        </Typography>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {news.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image || `https://source.unsplash.com/random/300x200/?disaster&sig=${item.id}`}
                    alt={item.title}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 1 
                      }}
                    >
                      <Chip 
                        size="small" 
                        label={item.category} 
                        sx={{ 
                          backgroundColor: '#f5f5f5', 
                          color: '#616161',
                          fontWeight: 600,
                          borderRadius: '4px'
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ color: '#757575' }}
                      >
                        {item.date}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{ 
                        mt: 1,
                        fontWeight: 600,
                        color: '#212121',
                        lineHeight: 1.3
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        color: '#616161',
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.summary}
                    </Typography>
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#d32f2f', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Read More
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Affected Areas */}
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mt: 5, 
            mb: 3, 
            fontWeight: 700, 
            color: '#212121',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 80,
              height: 4,
              backgroundColor: '#d32f2f',
              borderRadius: 2
            }
          }}
        >
          Most Affected Areas
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {affectedAreas.map((area) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={area.id}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon 
                    sx={{ 
                      mr: 1, 
                      color: '#d32f2f',
                      fontSize: 28
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    component="h3"
                    sx={{ 
                      fontWeight: 600,
                      color: '#212121'
                    }}
                  >
                    {area.name}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
                  {area.description}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242', mb: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>Disaster Type:</Box> {area.disasterType}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242', mb: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>Severity:</Box> {area.severity}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#424242' }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>Status:</Box> {area.status}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#212121', color: 'white', py: 6, mt: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Disaster Management Platform
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                A comprehensive solution for disaster management, resource coordination, and emergency response.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                {/* Social media icons would go here */}
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                    Login
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/register" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                    Register
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                    Home
                  </Link>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Contact Emergency Services
              </Typography>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: 1 }}>
                <Typography variant="body1" sx={{ color: '#f44336', fontWeight: 700, mb: 1 }}>
                  Emergency Hotlines
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                  National Emergency: <Box component="span" sx={{ color: 'white', fontWeight: 600 }}>112</Box>
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                  Medical Emergency: <Box component="span" sx={{ color: 'white', fontWeight: 600 }}>108</Box>
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                  Disaster Management: <Box component="span" sx={{ color: 'white', fontWeight: 600 }}>1078</Box>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              &copy; {new Date().getFullYear()} Disaster Management Platform. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
