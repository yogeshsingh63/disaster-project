const Disaster = require('../models/disaster.model');
const User = require('../models/user.model');

// @desc    Create a new disaster
// @route   POST /api/disasters
// @access  Private/Admin
exports.createDisaster = async (req, res) => {
  try {
    const { name, type, description, severity, affectedAreas, alertMessage, resourcesNeeded } = req.body;
    
    // Create disaster
    const disaster = await Disaster.create({
      name,
      type,
      description,
      severity,
      affectedAreas,
      alertMessage,
      resourcesNeeded,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: disaster,
      message: 'Disaster created successfully'
    });
  } catch (error) {
    console.error('Create disaster error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating disaster',
      error: error.message
    });
  }
};

// @desc    Get all disasters
// @route   GET /api/disasters
// @access  Public
exports.getAllDisasters = async (req, res) => {
  try {
    const disasters = await Disaster.find()
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    res.status(200).json({
      success: true,
      count: disasters.length,
      data: disasters
    });
  } catch (error) {
    console.error('Get all disasters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching disasters',
      error: error.message
    });
  }
};

// @desc    Get active disasters
// @route   GET /api/disasters/active
// @access  Public
exports.getActiveDisasters = async (req, res) => {
  try {
    const disasters = await Disaster.find({ isActive: true })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    res.status(200).json({
      success: true,
      count: disasters.length,
      data: disasters
    });
  } catch (error) {
    console.error('Get active disasters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active disasters',
      error: error.message
    });
  }
};

// @desc    Get a single disaster
// @route   GET /api/disasters/:id
// @access  Public
exports.getDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: disaster
    });
  } catch (error) {
    console.error('Get disaster error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching disaster',
      error: error.message
    });
  }
};

// @desc    Update a disaster
// @route   PUT /api/disasters/:id
// @access  Private/Admin
exports.updateDisaster = async (req, res) => {
  try {
    let disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    
    // Update disaster
    disaster = await Disaster.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: disaster,
      message: 'Disaster updated successfully'
    });
  } catch (error) {
    console.error('Update disaster error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating disaster',
      error: error.message
    });
  }
};

// @desc    Delete a disaster
// @route   DELETE /api/disasters/:id
// @access  Private/Admin
exports.deleteDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    
    await disaster.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Disaster deleted successfully'
    });
  } catch (error) {
    console.error('Delete disaster error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting disaster',
      error: error.message
    });
  }
};

// @desc    Add update to a disaster
// @route   POST /api/disasters/:id/updates
// @access  Private/Admin
exports.addDisasterUpdate = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Update message is required'
      });
    }
    
    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    
    // Add update to disaster
    disaster.updates.push({
      message,
      updatedBy: req.user._id
    });
    
    // Update the updatedBy field
    disaster.updatedBy = req.user._id;
    
    await disaster.save();
    
    res.status(200).json({
      success: true,
      data: disaster,
      message: 'Disaster update added successfully'
    });
  } catch (error) {
    console.error('Add disaster update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding disaster update',
      error: error.message
    });
  }
};

// @desc    Get disasters by location
// @route   GET /api/disasters/location
// @access  Public
exports.getDisastersByLocation = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 50000 } = req.query; // maxDistance in meters, default 50km
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    const disasters = await Disaster.find({
      isActive: true,
      'affectedAreas': {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          }
        }
      }
    }).populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: disasters.length,
      data: disasters
    });
  } catch (error) {
    console.error('Get disasters by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching disasters by location',
      error: error.message
    });
  }
};

// @desc    Send disaster alert
// @route   POST /api/disasters/:id/alert
// @access  Private/Admin
exports.sendDisasterAlert = async (req, res) => {
  try {
    const { alertMessage } = req.body;
    
    if (!alertMessage) {
      return res.status(400).json({
        success: false,
        message: 'Alert message is required'
      });
    }
    
    const disaster = await Disaster.findById(req.params.id);
    
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    
    // Update alert message
    disaster.alertMessage = alertMessage;
    await disaster.save();
    
    // The actual sending of the alert will be handled by Socket.io
    // This endpoint just updates the alert message in the database
    
    res.status(200).json({
      success: true,
      data: disaster,
      message: 'Disaster alert updated successfully'
    });
  } catch (error) {
    console.error('Send disaster alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending disaster alert',
      error: error.message
    });
  }
};
