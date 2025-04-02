const User = require('../models/user.model');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private/Admin
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    const validRoles = ['Admin', 'NGO', 'Volunteer', 'AffectedIndividual'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    const users = await User.find({ role }).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users by role',
      error: error.message
    });
  }
};

// @desc    Get unverified users
// @route   GET /api/users/unverified
// @access  Private/Admin
exports.getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      isVerified: false,
      role: { $in: ['NGO', 'Volunteer'] }
    }).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get unverified users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unverified users',
      error: error.message
    });
  }
};

// @desc    Verify a user
// @route   PUT /api/users/verify/:id
// @access  Private/Admin
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update verification status
    user.isVerified = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'User verified successfully'
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying user',
      error: error.message
    });
  }
};

// @desc    Reject a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Fields that can be updated by any user
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    
    // Role-specific updates
    if (user.role === 'NGO' && req.body.ngoDetails) {
      user.ngoDetails = {
        ...user.ngoDetails,
        ...req.body.ngoDetails
      };
    }
    
    if (user.role === 'Volunteer' && req.body.volunteerDetails) {
      user.volunteerDetails = {
        ...user.volunteerDetails,
        ...req.body.volunteerDetails
      };
    }
    
    if (user.role === 'AffectedIndividual' && req.body.affectedDetails) {
      user.affectedDetails = {
        ...user.affectedDetails,
        ...req.body.affectedDetails
      };
    }
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
};

// @desc    Update volunteer location
// @route   PUT /api/users/location
// @access  Private/Volunteer
exports.updateLocation = async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates format. Should be [longitude, latitude]'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role !== 'Volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Only volunteers can update their location'
      });
    }
    
    // Update volunteer location
    user.volunteerDetails.currentLocation = {
      type: 'Point',
      coordinates
    };
    
    // Set volunteer as active
    user.volunteerDetails.isActive = true;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.volunteerDetails.currentLocation,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating location',
      error: error.message
    });
  }
};

// @desc    Get nearby volunteers
// @route   GET /api/users/volunteers/nearby
// @access  Private/Admin,NGO
exports.getNearbyVolunteers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    const volunteers = await User.find({
      role: 'Volunteer',
      isVerified: true,
      'volunteerDetails.isActive': true,
      'volunteerDetails.currentLocation': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('-password');
    
    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers
    });
  } catch (error) {
    console.error('Get nearby volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby volunteers',
      error: error.message
    });
  }
};
