const express = require('express');
const { 
  createDisaster, 
  getAllDisasters, 
  getActiveDisasters, 
  getDisaster, 
  updateDisaster, 
  deleteDisaster, 
  addDisasterUpdate,
  getDisastersByLocation,
  sendDisasterAlert
} = require('../controllers/disaster.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Disaster routes
router.post('/', protect, authorize('Admin'), createDisaster);
router.get('/', getAllDisasters);
router.get('/active', getActiveDisasters);
router.get('/location', getDisastersByLocation);
router.get('/:id', getDisaster);
router.put('/:id', protect, authorize('Admin'), updateDisaster);
router.delete('/:id', protect, authorize('Admin'), deleteDisaster);
router.post('/:id/updates', protect, authorize('Admin'), addDisasterUpdate);
router.post('/:id/alert', protect, authorize('Admin'), sendDisasterAlert);

module.exports = router;
