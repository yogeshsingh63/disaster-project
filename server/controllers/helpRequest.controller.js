const HelpRequest = require('../models/helpRequest.model');
const User = require('../models/user.model');

// @desc    Create a new help request
// @route   POST /api/help-requests
// @access  Private/AffectedIndividual
exports.createHelpRequest = async (req, res) => {
  try {
    const { requestType, description, urgency, location, numberOfPeople, disaster, images } = req.body;
    
    // Create help request
    const helpRequest = await HelpRequest.create({
      requestedBy: req.user._id,
      requestType,
      description,
      urgency,
      location,
      numberOfPeople,
      disaster,
      images
    });
    
    res.status(201).json({
      success: true,
      data: helpRequest,
      message: 'Help request created successfully'
    });
  } catch (error) {
    console.error('Create help request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating help request',
      error: error.message
    });
  }
};

// @desc    Get all help requests
// @route   GET /api/help-requests
// @access  Private/Admin,NGO
exports.getAllHelpRequests = async (req, res) => {
  try {
    const helpRequests = await HelpRequest.find()
      .populate('requestedBy', 'name phone')
      .populate('disaster', 'name type')
      .populate('assignedTo.ngo', 'name')
      .populate('assignedTo.volunteer', 'name');
    
    res.status(200).json({
      success: true,
      count: helpRequests.length,
      data: helpRequests
    });
  } catch (error) {
    console.error('Get all help requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching help requests',
      error: error.message
    });
  }
};

// @desc    Get help requests by status
// @route   GET /api/help-requests/status/:status
// @access  Private/Admin,NGO
exports.getHelpRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status specified'
      });
    }
    
    const helpRequests = await HelpRequest.find({ status })
      .populate('requestedBy', 'name phone')
      .populate('disaster', 'name type')
      .populate('assignedTo.ngo', 'name')
      .populate('assignedTo.volunteer', 'name');
    
    res.status(200).json({
      success: true,
      count: helpRequests.length,
      data: helpRequests
    });
  } catch (error) {
    console.error('Get help requests by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching help requests by status',
      error: error.message
    });
  }
};

// @desc    Get help requests by type
// @route   GET /api/help-requests/type/:type
// @access  Private/Admin,NGO
exports.getHelpRequestsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate request type
    const validTypes = ['Food', 'Water', 'Shelter', 'Medical', 'Rescue', 'Other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request type specified'
      });
    }
    
    const helpRequests = await HelpRequest.find({ requestType: type })
      .populate('requestedBy', 'name phone')
      .populate('disaster', 'name type')
      .populate('assignedTo.ngo', 'name')
      .populate('assignedTo.volunteer', 'name');
    
    res.status(200).json({
      success: true,
      count: helpRequests.length,
      data: helpRequests
    });
  } catch (error) {
    console.error('Get help requests by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching help requests by type',
      error: error.message
    });
  }
};

// @desc    Get a single help request
// @route   GET /api/help-requests/:id
// @access  Private
exports.getHelpRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id)
      .populate('requestedBy', 'name phone')
      .populate('disaster', 'name type')
      .populate('assignedTo.ngo', 'name')
      .populate('assignedTo.volunteer', 'name');
    
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found'
      });
    }
    
    // Check if user is authorized to view this help request
    const isAdmin = req.user.role === 'Admin';
    const isNGO = req.user.role === 'NGO';
    const isAssignedNGO = helpRequest.assignedTo.ngo && helpRequest.assignedTo.ngo.toString() === req.user._id.toString();
    const isAssignedVolunteer = helpRequest.assignedTo.volunteer && helpRequest.assignedTo.volunteer.toString() === req.user._id.toString();
    const isRequestor = helpRequest.requestedBy._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isNGO && !isAssignedNGO && !isAssignedVolunteer && !isRequestor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this help request'
      });
    }
    
    res.status(200).json({
      success: true,
      data: helpRequest
    });
  } catch (error) {
    console.error('Get help request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching help request',
      error: error.message
    });
  }
};

// @desc    Update a help request
// @route   PUT /api/help-requests/:id
// @access  Private/AffectedIndividual
exports.updateHelpRequest = async (req, res) => {
  try {
    let helpRequest = await HelpRequest.findById(req.params.id);
    
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found'
      });
    }
    
    // Check if the help request belongs to the user
    if (helpRequest.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this help request'
      });
    }
    
    // Prevent updating if the request is already assigned or in progress
    if (helpRequest.status !== 'Pending' && helpRequest.status !== 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update help request with status: ${helpRequest.status}`
      });
    }
    
    // Update help request
    helpRequest = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: helpRequest,
      message: 'Help request updated successfully'
    });
  } catch (error) {
    console.error('Update help request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating help request',
      error: error.message
    });
  }
};

// @desc    Cancel a help request
// @route   PUT /api/help-requests/:id/cancel
// @access  Private/AffectedIndividual
exports.cancelHelpRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(req.params.id);
    
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found'
      });
    }
    
    // Check if the help request belongs to the user
    if (helpRequest.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this help request'
      });
    }
    
    // Prevent cancelling if the request is already resolved
    if (helpRequest.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a resolved help request'
      });
    }
    
    // Update help request status
    helpRequest.status = 'Cancelled';
    await helpRequest.save();
    
    res.status(200).json({
      success: true,
      data: helpRequest,
      message: 'Help request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel help request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling help request',
      error: error.message
    });
  }
};

// @desc    Assign NGO and volunteer to a help request
// @route   PUT /api/help-requests/:id/assign
// @access  Private/Admin,NGO
exports.assignHelpRequest = async (req, res) => {
  try {
    const { ngo, volunteer } = req.body;
    
    const helpRequest = await HelpRequest.findById(req.params.id);
    
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found'
      });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'Admin';
    const isNGO = req.user.role === 'NGO' && ngo === req.user._id.toString();
    
    if (!isAdmin && !isNGO) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign this help request'
      });
    }
    
    // Verify that NGO exists and is verified
    if (ngo) {
      const ngoUser = await User.findById(ngo);
      if (!ngoUser || ngoUser.role !== 'NGO' || !ngoUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or unverified NGO'
        });
      }
      helpRequest.assignedTo.ngo = ngo;
    }
    
    // Verify that volunteer exists and is verified
    if (volunteer) {
      const volunteerUser = await User.findById(volunteer);
      if (!volunteerUser || volunteerUser.role !== 'Volunteer' || !volunteerUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or unverified volunteer'
        });
      }
      helpRequest.assignedTo.volunteer = volunteer;
    }
    
    // Update help request status
    helpRequest.status = 'Assigned';
    await helpRequest.save();
    
    res.status(200).json({
      success: true,
      data: helpRequest,
      message: 'Help request assigned successfully'
    });
  } catch (error) {
    console.error('Assign help request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning help request',
      error: error.message
    });
  }
};

// @desc    Update help request status
// @route   PUT /api/help-requests/:id/status
// @access  Private/Admin,NGO,Volunteer
exports.updateHelpRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status
    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status specified'
      });
    }
    
    const helpRequest = await HelpRequest.findById(req.params.id);
    
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found'
      });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'Admin';
    const isAssignedNGO = helpRequest.assignedTo.ngo && helpRequest.assignedTo.ngo.toString() === req.user._id.toString();
    const isAssignedVolunteer = helpRequest.assignedTo.volunteer && helpRequest.assignedTo.volunteer.toString() === req.user._id.toString();
    
    if (!isAdmin && !isAssignedNGO && !isAssignedVolunteer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this help request status'
      });
    }
    
    // Update help request status
    helpRequest.status = status;
    
    // Add update to help request
    helpRequest.updates.push({
      message: `Status updated to ${status}`,
      updatedBy: req.user._id
    });
    
    await helpRequest.save();
    
    res.status(200).json({
      success: true,
      data: helpRequest,
      message: 'Help request status updated successfully'
    });
  } catch (error) {
    console.error('Update help request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating help request status',
      error: error.message
    });
  }
};

// @desc    Add update to a help request
// @route   POST /api/help-requests/:id/updates
// @access  Private/Admin,NGO,Volunteer
exports.addHelpRequestUpdate = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Update message is required'
      });
    }
    
    const helpRequest = await HelpRequest.findById(req.params.id);
    
    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: 'Help request not found'
      });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'Admin';
    const isAssignedNGO = helpRequest.assignedTo.ngo && helpRequest.assignedTo.ngo.toString() === req.user._id.toString();
    const isAssignedVolunteer = helpRequest.assignedTo.volunteer && helpRequest.assignedTo.volunteer.toString() === req.user._id.toString();
    
    if (!isAdmin && !isAssignedNGO && !isAssignedVolunteer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add updates to this help request'
      });
    }
    
    // Add update to help request
    helpRequest.updates.push({
      message,
      updatedBy: req.user._id
    });
    
    await helpRequest.save();
    
    res.status(200).json({
      success: true,
      data: helpRequest,
      message: 'Help request update added successfully'
    });
  } catch (error) {
    console.error('Add help request update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding help request update',
      error: error.message
    });
  }
};

// @desc    Get nearby help requests
// @route   GET /api/help-requests/nearby
// @access  Private/Admin,NGO
exports.getNearbyHelpRequests = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    const helpRequests = await HelpRequest.find({
      status: { $in: ['Pending', 'Assigned'] },
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
      .populate('requestedBy', 'name phone')
      .populate('disaster', 'name type');
    
    res.status(200).json({
      success: true,
      count: helpRequests.length,
      data: helpRequests
    });
  } catch (error) {
    console.error('Get nearby help requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby help requests',
      error: error.message
    });
  }
};
