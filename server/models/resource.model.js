const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Food', 'Water', 'Shelter', 'Medical', 'Clothing', 'Rescue', 'Other'],
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
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
  providedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the NGO providing the resource
    required: true
  },
  disaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  },
  images: [String], // URLs to resource images
  assignedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Available', 'In Transit', 'Delivered', 'Depleted'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geospatial queries
resourceSchema.index({ 'location.coordinates': '2dsphere' });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
