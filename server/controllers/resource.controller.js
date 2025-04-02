const Resource = require('../models/resource.model');
const User = require('../models/user.model');
const HelpRequest = require('../models/helpRequest.model');

// @desc    Create a new resource
// @route   POST /api/resources
// @access  Private/NGO
exports.createResource = async (req, res) => {
  try {
    const { type, name, description, quantity, unit, location, disaster, expiryDate } = req.body;
    
    // Create resource
    const resource = await Resource.create({
      type,
      name,
      description,
      quantity,
      unit,
      location,
      providedBy: req.user._id,
      disaster,
      expiryDate
    });
    
    res.status(201).json({
      success: true,
      data: resource,
      message: 'Resource created successfully'
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating resource',
      error: error.message
    });
  }
};

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('providedBy', 'name')
      .populate('disaster', 'name type')
      .populate('assignedVolunteers', 'name');
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Get all resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resources',
      error: error.message
    });
  }
};

// @desc    Get resources by type
// @route   GET /api/resources/type/:type
// @access  Public
exports.getResourcesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate resource type
    const validTypes = ['Food', 'Water', 'Shelter', 'Medical', 'Clothing', 'Rescue', 'Other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resource type specified'
      });
    }
    
    const resources = await Resource.find({ type, isAvailable: true })
      .populate('providedBy', 'name')
      .populate('disaster', 'name type')
      .populate('assignedVolunteers', 'name');
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Get resources by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resources by type',
      error: error.message
    });
  }
};

// @desc    Get resources by NGO
// @route   GET /api/resources/ngo/:id
// @access  Public
exports.getResourcesByNGO = async (req, res) => {
  try {
    const resources = await Resource.find({ providedBy: req.params.id })
      .populate('providedBy', 'name')
      .populate('disaster', 'name type')
      .populate('assignedVolunteers', 'name');
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Get resources by NGO error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resources by NGO',
      error: error.message
    });
  }
};

// @desc    Get a single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('providedBy', 'name')
      .populate('disaster', 'name type')
      .populate('assignedVolunteers', 'name');
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resource',
      error: error.message
    });
  }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/NGO
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if the resource belongs to the NGO
    if (resource.providedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }
    
    // Update resource
    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: resource,
      message: 'Resource updated successfully'
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resource',
      error: error.message
    });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/NGO
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if the resource belongs to the NGO
    if (resource.providedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }
    
    await resource.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting resource',
      error: error.message
    });
  }
};

// @desc    Assign volunteers to a resource
// @route   PUT /api/resources/:id/assign
// @access  Private/NGO
exports.assignVolunteers = async (req, res) => {
  try {
    const { volunteers } = req.body;
    
    if (!volunteers || !Array.isArray(volunteers)) {
      return res.status(400).json({
        success: false,
        message: 'Volunteers array is required'
      });
    }
    
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if the resource belongs to the NGO
    if (resource.providedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign volunteers to this resource'
      });
    }
    
    // Verify that all volunteers exist and are verified
    for (const volunteerId of volunteers) {
      const volunteer = await User.findById(volunteerId);
      
      if (!volunteer || volunteer.role !== 'Volunteer' || !volunteer.isVerified) {
        return res.status(400).json({
          success: false,
          message: `Invalid or unverified volunteer ID: ${volunteerId}`
        });
      }
    }
    
    // Update resource with assigned volunteers
    resource.assignedVolunteers = volunteers;
    resource.status = 'In Transit';
    await resource.save();
    
    res.status(200).json({
      success: true,
      data: resource,
      message: 'Volunteers assigned successfully'
    });
  } catch (error) {
    console.error('Assign volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning volunteers',
      error: error.message
    });
  }
};

// @desc    Update resource status
// @route   PUT /api/resources/:id/status
// @access  Private/NGO,Volunteer
exports.updateResourceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status
    const validStatuses = ['Available', 'In Transit', 'Delivered', 'Depleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status specified'
      });
    }
    
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check authorization
    const isNGO = req.user.role === 'NGO' && resource.providedBy.toString() === req.user._id.toString();
    const isAssignedVolunteer = req.user.role === 'Volunteer' && resource.assignedVolunteers.includes(req.user._id);
    
    if (!isNGO && !isAssignedVolunteer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource status'
      });
    }
    
    // Update resource status
    resource.status = status;
    
    // If status is 'Delivered' or 'Depleted', set isAvailable to false
    if (status === 'Delivered' || status === 'Depleted') {
      resource.isAvailable = false;
    }
    
    await resource.save();
    
    res.status(200).json({
      success: true,
      data: resource,
      message: 'Resource status updated successfully'
    });
  } catch (error) {
    console.error('Update resource status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resource status',
      error: error.message
    });
  }
};

// @desc    Get nearby resources
// @route   GET /api/resources/nearby
// @access  Public
exports.getNearbyResources = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000, type } = req.query; // maxDistance in meters, default 10km
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    // Build query
    const query = {
      isAvailable: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };
    
    // Add type filter if provided
    if (type) {
      query.type = type;
    }
    
    const resources = await Resource.find(query)
      .populate('providedBy', 'name')
      .populate('disaster', 'name type');
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Get nearby resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby resources',
      error: error.message
    });
  }
};
