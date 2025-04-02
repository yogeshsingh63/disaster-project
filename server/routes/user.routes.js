const express = require('express');
const { 
  getAllUsers, 
  getUsersByRole, 
  getUnverifiedUsers, 
  verifyUser, 
  deleteUser, 
  updateProfile, 
  updateLocation,
  getNearbyVolunteers
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// User routes
router.get('/', protect, authorize('Admin'), getAllUsers);
router.get('/role/:role', protect, authorize('Admin'), getUsersByRole);
router.get('/unverified', protect, authorize('Admin'), getUnverifiedUsers);
router.put('/verify/:id', protect, authorize('Admin'), verifyUser);
router.delete('/:id', protect, authorize('Admin'), deleteUser);
router.put('/profile', protect, updateProfile);
router.put('/location', protect, authorize('Volunteer'), updateLocation);
router.get('/volunteers/nearby', protect, authorize('Admin', 'NGO'), getNearbyVolunteers);

module.exports = router;
