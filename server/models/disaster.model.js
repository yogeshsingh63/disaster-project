const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Flood', 'Earthquake', 'Cyclone', 'Fire', 'Landslide', 'Tsunami', 'Drought', 'Other'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  affectedAreas: [{
    // GeoJSON for polygon or point
    type: {
      type: String,
      enum: ['Polygon', 'Point'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // For Polygon: array of linear rings
      required: true
    },
    name: String, // Name of the area
    pincode: String,
    state: String,
    district: String
  }],
  alertMessage: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resourcesNeeded: [{
    type: String,
    enum: ['Food', 'Water', 'Shelter', 'Medical', 'Clothing', 'Rescue', 'Other']
  }],
  images: [String], // URLs to disaster images
  updates: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Create a 2dsphere index for geospatial queries
disasterSchema.index({ 'affectedAreas.coordinates': '2dsphere' });

const Disaster = mongoose.model('Disaster', disasterSchema);

module.exports = Disaster;
