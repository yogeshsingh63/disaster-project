import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = Icon.Default.prototype;
DefaultIcon.options.iconUrl = icon;
DefaultIcon.options.shadowUrl = iconShadow;
Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow
});

const DisasterMap = ({ 
  disasters = [], 
  resources = [], 
  volunteers = [], 
  helpRequests = [],
  center = [20.5937, 78.9629], // Center of India
  zoom = 5
}) => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's current location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Custom marker icons
  const disasterIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const resourceIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const volunteerIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const helpRequestIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const userLocationIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <Box sx={{ height: '500px', width: '100%' }}>
      <MapContainer 
        center={userLocation || center} 
        zoom={userLocation ? 10 : zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User's current location */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <Typography variant="subtitle1">Your Location</Typography>
            </Popup>
          </Marker>
        )}
        
        {/* Disaster markers */}
        {disasters.map((disaster) => (
          <Marker 
            key={disaster._id} 
            position={disaster.location?.coordinates?.reverse() || center}
            icon={disasterIcon}
          >
            <Popup>
              <Paper elevation={0} sx={{ p: 1 }}>
                <Typography variant="subtitle1">{disaster.name}</Typography>
                <Typography variant="body2">{disaster.description}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={disaster.type} 
                    color="error" 
                    size="small" 
                    sx={{ mr: 0.5 }} 
                  />
                  <Chip 
                    label={disaster.severity} 
                    color="warning" 
                    size="small" 
                  />
                </Box>
              </Paper>
            </Popup>
          </Marker>
        ))}
        
        {/* Resource markers */}
        {resources.map((resource) => (
          <Marker 
            key={resource._id} 
            position={resource.location?.coordinates?.reverse() || center}
            icon={resourceIcon}
          >
            <Popup>
              <Paper elevation={0} sx={{ p: 1 }}>
                <Typography variant="subtitle1">{resource.name}</Typography>
                <Typography variant="body2">{resource.description}</Typography>
                <Typography variant="body2">
                  Quantity: {resource.quantity} {resource.unit}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={resource.type} 
                    color="success" 
                    size="small" 
                    sx={{ mr: 0.5 }} 
                  />
                  <Chip 
                    label={resource.status} 
                    color="info" 
                    size="small" 
                  />
                </Box>
              </Paper>
            </Popup>
          </Marker>
        ))}
        
        {/* Volunteer markers */}
        {volunteers.map((volunteer) => (
          <Marker 
            key={volunteer._id} 
            position={volunteer.volunteerDetails?.currentLocation?.coordinates?.reverse() || center}
            icon={volunteerIcon}
          >
            <Popup>
              <Paper elevation={0} sx={{ p: 1 }}>
                <Typography variant="subtitle1">{volunteer.name}</Typography>
                <Typography variant="body2">
                  Skills: {volunteer.volunteerDetails?.skills?.join(', ')}
                </Typography>
                <Typography variant="body2">
                  Availability: {volunteer.volunteerDetails?.availability}
                </Typography>
              </Paper>
            </Popup>
          </Marker>
        ))}
        
        {/* Help Request markers */}
        {helpRequests.map((request) => (
          <Marker 
            key={request._id} 
            position={request.location?.coordinates?.reverse() || center}
            icon={helpRequestIcon}
          >
            <Popup>
              <Paper elevation={0} sx={{ p: 1 }}>
                <Typography variant="subtitle1">Help Request</Typography>
                <Typography variant="body2">{request.description}</Typography>
                <Typography variant="body2">
                  People: {request.numberOfPeople}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {request.requestType.map((type) => (
                    <Chip 
                      key={type} 
                      label={type} 
                      color="warning" 
                      size="small" 
                      sx={{ mr: 0.5 }} 
                    />
                  ))}
                  <Chip 
                    label={request.status} 
                    color="info" 
                    size="small" 
                  />
                </Box>
              </Paper>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default DisasterMap;
