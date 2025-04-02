const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['Admin', 'NGO', 'Volunteer', 'AffectedIndividual'],
    default: 'AffectedIndividual'
  },
  isVerified: {
    type: Boolean,
    default: function() {
      // Admin is automatically verified, others need verification
      return this.role === 'Admin';
    }
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  profilePicture: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Fields specific to NGOs
  ngoDetails: {
    registrationNumber: String,
    description: String,
    website: String,
    foundedYear: Number,
    documents: [String] // URLs to verification documents
  },
  // Fields specific to Volunteers
  volunteerDetails: {
    skills: [String],
    availability: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Weekends', 'Emergency-only']
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  // Fields specific to Affected Individuals
  affectedDetails: {
    currentNeeds: [String], // e.g., ['Food', 'Shelter', 'Medical']
    familySize: Number,
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    medicalConditions: [String]
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ 'volunteerDetails.currentLocation': '2dsphere' });
userSchema.index({ 'affectedDetails.currentLocation': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
