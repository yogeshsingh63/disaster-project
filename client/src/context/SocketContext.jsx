import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Only connect if user is authenticated
    if (user) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
        auth: {
          token: user.token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);

        // Join appropriate room based on user role
        newSocket.emit('join-room', 'all-users');
        if (user.role === 'Admin') {
          newSocket.emit('join-room', 'admin');
        } else if (user.role === 'NGO') {
          newSocket.emit('join-room', 'ngo');
        } else if (user.role === 'Volunteer') {
          newSocket.emit('join-room', 'volunteer');
        } else if (user.role === 'AffectedIndividual') {
          newSocket.emit('join-room', 'affected');
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('disaster-alert', (data) => {
        console.log('Disaster alert received:', data);
        setAlerts((prevAlerts) => [data, ...prevAlerts]);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }

    return () => {}; // Empty cleanup if no user
  }, [user]);

  // Send disaster alert (Admin only)
  const sendDisasterAlert = (alertData) => {
    if (socket && connected && user?.role === 'Admin') {
      socket.emit('disaster-alert', alertData);
      return true;
    }
    return false;
  };

  // Update volunteer location (Volunteer only)
  const updateLocation = (locationData) => {
    if (socket && connected && user?.role === 'Volunteer') {
      socket.emit('update-location', locationData);
      return true;
    }
    return false;
  };

  // Clear a specific alert
  const clearAlert = (alertId) => {
    setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== alertId));
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        alerts,
        sendDisasterAlert,
        updateLocation,
        clearAlert,
        clearAllAlerts
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
