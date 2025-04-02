const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock data
const users = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGV1jMOUuI.zxGS.xYZt.YjJJ06', // 'password'
    role: 'Admin',
    isVerified: true
  },
  {
    _id: '2',
    name: 'NGO Organization',
    email: 'ngo@example.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGV1jMOUuI.zxGS.xYZt.YjJJ06', // 'password'
    role: 'NGO',
    isVerified: true,
    ngoDetails: {
      registrationNumber: 'NGO123456',
      description: 'We provide disaster relief services',
      website: 'www.ngoorg.com'
    }
  },
  {
    _id: '3',
    name: 'Volunteer Person',
    email: 'volunteer@example.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGV1jMOUuI.zxGS.xYZt.YjJJ06', // 'password'
    role: 'Volunteer',
    isVerified: true,
    volunteerDetails: {
      skills: ['First Aid', 'Driving'],
      availability: 'Full-time',
      isActive: true
    }
  },
  {
    _id: '4',
    name: 'Affected Person',
    email: 'affected@example.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGV1jMOUuI.zxGS.xYZt.YjJJ06', // 'password'
    role: 'AffectedIndividual',
    isVerified: true,
    affectedDetails: {
      familySize: 4,
      currentNeeds: ['Food', 'Shelter']
    }
  },
  {
    _id: '5',
    name: 'Pending NGO',
    email: 'pending@example.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGV1jMOUuI.zxGS.xYZt.YjJJ06', // 'password'
    role: 'NGO',
    isVerified: false
  }
];

const disasters = [
  {
    _id: '1',
    name: 'Flood in Mumbai',
    type: 'Flood',
    description: 'Severe flooding in Mumbai due to heavy rainfall',
    severity: 'High',
    startDate: new Date('2025-03-20'),
    isActive: true,
    alertMessage: 'Evacuate low-lying areas immediately',
    createdBy: '1',
    resourcesNeeded: ['Food', 'Water', 'Shelter']
  },
  {
    _id: '2',
    name: 'Earthquake in Delhi',
    type: 'Earthquake',
    description: 'Magnitude 6.5 earthquake in Delhi region',
    severity: 'Critical',
    startDate: new Date('2025-03-25'),
    isActive: true,
    alertMessage: 'Stay in open areas, avoid damaged buildings',
    createdBy: '1',
    resourcesNeeded: ['Medical', 'Shelter', 'Rescue']
  }
];

const resources = [
  {
    _id: '1',
    type: 'Food',
    name: 'Food Packages',
    description: 'Basic food supplies for a family of 4 for 3 days',
    quantity: 100,
    unit: 'packages',
    isAvailable: true,
    providedBy: '2',
    disaster: '1',
    status: 'Available'
  },
  {
    _id: '2',
    type: 'Water',
    name: 'Drinking Water',
    description: 'Clean drinking water in 1L bottles',
    quantity: 500,
    unit: 'bottles',
    isAvailable: true,
    providedBy: '2',
    disaster: '1',
    status: 'Available'
  },
  {
    _id: '3',
    type: 'Medical',
    name: 'First Aid Kits',
    description: 'Basic first aid supplies',
    quantity: 50,
    unit: 'kits',
    isAvailable: true,
    providedBy: '2',
    disaster: '2',
    status: 'Available'
  }
];

const helpRequests = [
  {
    _id: '1',
    requestedBy: '4',
    disaster: '1',
    requestType: ['Food', 'Water'],
    description: 'Family of 4 stranded without supplies',
    urgency: 'High',
    status: 'Pending',
    numberOfPeople: 4
  },
  {
    _id: '2',
    requestedBy: '4',
    disaster: '2',
    requestType: ['Medical'],
    description: 'Need medical assistance for elderly person',
    urgency: 'Critical',
    status: 'Assigned',
    assignedTo: {
      ngo: '2',
      volunteer: '3'
    },
    numberOfPeople: 2
  }
];

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key_here';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Auth middleware
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  if ((user.role === 'NGO' || user.role === 'Volunteer') && !user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Your account is not verified yet. Please wait for admin approval.'
    });
  }
  
  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id)
    },
    message: 'Login successful'
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (users.some(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const newUser = {
    _id: (users.length + 1).toString(),
    name,
    email,
    password: hashedPassword,
    role,
    isVerified: role === 'Admin' || role === 'AffectedIndividual'
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified,
      token: generateToken(newUser._id)
    },
    message: newUser.role === 'Admin' || newUser.role === 'AffectedIndividual' 
      ? 'Registration successful' 
      : 'Registration successful. Please wait for admin verification.'
  });
});

app.get('/api/auth/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// User routes
app.get('/api/users', protect, (req, res) => {
  res.status(200).json({
    success: true,
    count: users.length,
    data: users.map(u => ({ ...u, password: undefined }))
  });
});

app.get('/api/users/unverified', protect, (req, res) => {
  const unverifiedUsers = users.filter(u => !u.isVerified && (u.role === 'NGO' || u.role === 'Volunteer'));
  
  res.status(200).json({
    success: true,
    count: unverifiedUsers.length,
    data: unverifiedUsers.map(u => ({ ...u, password: undefined }))
  });
});

app.put('/api/users/verify/:id', protect, (req, res) => {
  const user = users.find(u => u._id === req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  user.isVerified = true;
  
  res.status(200).json({
    success: true,
    data: { ...user, password: undefined },
    message: 'User verified successfully'
  });
});

// Disaster routes
app.get('/api/disasters', (req, res) => {
  res.status(200).json({
    success: true,
    count: disasters.length,
    data: disasters
  });
});

app.get('/api/disasters/active', (req, res) => {
  const activeDisasters = disasters.filter(d => d.isActive);
  
  res.status(200).json({
    success: true,
    count: activeDisasters.length,
    data: activeDisasters
  });
});

// Resource routes
app.get('/api/resources', (req, res) => {
  const resourcesWithProviders = resources.map(resource => {
    const provider = users.find(u => u._id === resource.providedBy);
    return {
      ...resource,
      providedBy: {
        _id: provider._id,
        name: provider.name
      }
    };
  });
  
  res.status(200).json({
    success: true,
    count: resources.length,
    data: resourcesWithProviders
  });
});

app.get('/api/resources/ngo/:id', (req, res) => {
  const ngoResources = resources.filter(r => r.providedBy === req.params.id);
  
  res.status(200).json({
    success: true,
    count: ngoResources.length,
    data: ngoResources
  });
});

// Help request routes
app.get('/api/help-requests', (req, res) => {
  res.status(200).json({
    success: true,
    count: helpRequests.length,
    data: helpRequests
  });
});

app.get('/api/help-requests/status/:status', (req, res) => {
  const filteredRequests = helpRequests.filter(r => r.status === req.params.status);
  
  res.status(200).json({
    success: true,
    count: filteredRequests.length,
    data: filteredRequests
  });
});

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

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});
