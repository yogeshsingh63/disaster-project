const express = require('express');
const { 
  createResource, 
  getAllResources, 
  getResourcesByType, 
  getResourcesByNGO, 
  getResource, 
  updateResource, 
  deleteResource, 
  assignVolunteers,
  updateResourceStatus,
  getNearbyResources
} = require('../controllers/resource.controller');
const { protect, authorize, isVerified } = require('../middleware/auth.middleware');

const router = express.Router();

// Resource routes
router.post('/', protect, authorize('NGO'), isVerified, createResource);
router.get('/', getAllResources);
router.get('/type/:type', getResourcesByType);
router.get('/ngo/:id', getResourcesByNGO);
router.get('/nearby', getNearbyResources);
router.get('/:id', getResource);
router.put('/:id', protect, authorize('NGO'), isVerified, updateResource);
router.delete('/:id', protect, authorize('NGO'), isVerified, deleteResource);
router.put('/:id/assign', protect, authorize('NGO'), isVerified, assignVolunteers);
router.put('/:id/status', protect, authorize('NGO', 'Volunteer'), isVerified, updateResourceStatus);

module.exports = router;
