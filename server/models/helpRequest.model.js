const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  disaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
  },
  requestType: [{
    type: String,
    enum: ['Food', 'Water', 'Shelter', 'Medical', 'Rescue', 'Other'],
    required: true
  }],
  description: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    }
  },
  numberOfPeople: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'],
    default: 'Pending'
  },
  assignedTo: {
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  images: [String], // URLs to images related to the help request
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
helpRequestSchema.index({ 'location.coordinates': '2dsphere' });

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);

module.exports = HelpRequest;
