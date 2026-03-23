const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments,
  getTodayAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getAppointmentStats
} = require('../controllers/appointment.controller');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Appointment routes
router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);
router.get('/appointments/upcoming', getUpcomingAppointments);
router.get('/appointments/today', getTodayAppointments);
router.get('/appointments/stats', getAppointmentStats);
router.get('/appointments/:id', getAppointment);
router.put('/appointments/:id', updateAppointment);
router.patch('/appointments/:id/confirm', confirmAppointment);
router.patch('/appointments/:id/cancel', cancelAppointment);
router.patch('/appointments/:id/complete', completeAppointment);
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;
