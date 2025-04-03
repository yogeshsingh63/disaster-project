# Disaster Management Platform to help people in need

A comprehensive disaster management platform that connects affected individuals, volunteers, NGOs, and administrators to coordinate disaster relief efforts.

## Features

- **Role-based Access Control**: Admin, NGO, Volunteer, and Affected Individual roles
- **Real-time Disaster Alerts**: Broadcast alerts to users in affected areas
- **Resource Management**: Track and distribute relief resources
- **Volunteer Coordination**: Assign volunteers to tasks and track their locations
- **Help Request System**: Allow affected individuals to request specific help
- **Interactive Maps**: Visualize disasters, resources, and volunteers on maps
- **Real-time Communication**: Using Socket.io for instant updates

## Tech Stack

- **Frontend**: React, Material-UI, Leaflet Maps, Socket.io Client
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the server directory based on the provided `.env.example`

### Running the Application

1. Start the server:

```bash
cd server
npm run dev
```

2. Start the client:

```bash
cd client
npm run dev
```

3. Access the application at `http://localhost:5173`

## Project Structure

```
disaster_project/
├── client/                 # React frontend
│   ├── public/             # Public assets
│   └── src/                # Source files
│       ├── components/     # Reusable components
│       ├── context/        # Context providers
│       ├── pages/          # Page components
│       └── ...
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── ...
└── ...
```

## User Roles

### Admin
- Verify NGOs and volunteers
- Mark disaster-affected areas on the map
- Send real-time alerts/notifications
- Monitor relief activity

### NGO
- Add available resources
- Deploy volunteers
- Respond to affected individuals' requests

### Volunteer
- Share live location during relief work
- Deliver resources
- Assist people on the ground

### Affected Individual
- Report location and needs
- View nearby shelters and resources
- Receive real-time alerts
