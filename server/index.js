const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const disasterRoutes = require('./routes/disaster.routes');
const resourceRoutes = require('./routes/resource.routes');
const helpRequestRoutes = require('./routes/helpRequest.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/help-requests', helpRequestRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a room based on user role
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });
  
  // Handle disaster alerts
  socket.on('disaster-alert', (data) => {
    io.to('all-users').emit('disaster-alert', data);
    console.log('Disaster alert sent:', data);
  });
  
  // Handle volunteer location updates
  socket.on('update-location', (data) => {
    io.to('admin').emit('volunteer-location', data);
    io.to('ngo').emit('volunteer-location', data);
    console.log('Location updated:', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
