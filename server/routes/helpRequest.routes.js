const express = require('express');
const { 
  createHelpRequest, 
  getAllHelpRequests, 
  getHelpRequestsByStatus, 
  getHelpRequestsByType, 
  getHelpRequest, 
  updateHelpRequest, 
  cancelHelpRequest, 
  assignHelpRequest,
  updateHelpRequestStatus,
  addHelpRequestUpdate,
  getNearbyHelpRequests
} = require('../controllers/helpRequest.controller');
const { protect, authorize, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();

// Help request routes
router.post('/', protect, authorize('AffectedIndividual'), createHelpRequest);
router.get('/', protect, authorize('Admin', 'NGO'), getAllHelpRequests);
router.get('/status/:status', protect, authorize('Admin', 'NGO'), getHelpRequestsByStatus);
router.get('/type/:type', protect, authorize('Admin', 'NGO'), getHelpRequestsByType);
router.get('/nearby', protect, authorize('Admin', 'NGO'), getNearbyHelpRequests);
router.get('/:id', protect, getHelpRequest);
router.put('/:id', protect, authorize('AffectedIndividual'), updateHelpRequest);
router.put('/:id/cancel', protect, authorize('AffectedIndividual'), cancelHelpRequest);
router.put('/:id/assign', protect, authorize('Admin', 'NGO'), isVerified, assignHelpRequest);
router.put('/:id/status', protect, authorize('Admin', 'NGO', 'Volunteer'), isVerified, updateHelpRequestStatus);
router.post('/:id/updates', protect, authorize('Admin', 'NGO', 'Volunteer'), isVerified, addHelpRequestUpdate);

module.exports = router;
