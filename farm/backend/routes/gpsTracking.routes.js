const express = require('express');
const router = express.Router();
const {
  createGpsRecord,
  getCurrentLocation,
  getLocationHistory,
  getNearbyLocations,
  updateGpsRecord,
  deleteGpsRecord,
  getLocationStats,
  checkInTodo,
  checkOutTodo
} = require('../controllers/gpsTracking.controller');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Basic CRUD operations
router.post('/', createGpsRecord);
router.get('/current', getCurrentLocation);
router.get('/history', getLocationHistory);
router.get('/nearby', getNearbyLocations);
router.get('/stats', getLocationStats);
router.put('/:id', updateGpsRecord);
router.delete('/:id', deleteGpsRecord);

// Todo check-in/check-out operations
router.post('/checkin', checkInTodo);
router.post('/checkout', checkOutTodo);

module.exports = router;
