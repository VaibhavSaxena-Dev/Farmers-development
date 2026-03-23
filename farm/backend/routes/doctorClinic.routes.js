const express = require('express');
const router = express.Router();
const {
  // Doctor controllers
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorsForMap,
  getNearbyDoctors,
  
  // Clinic controllers
  createClinic,
  getClinics,
  getNearbyClinics,
  
  // Patient controllers
  createPatient,
  getPatients,
  getPatientsNearLocation
} = require('../controllers/doctorClinic.controller');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Doctor routes
router.post('/doctors', createDoctor);
router.get('/doctors', getDoctors);
router.get('/doctors/map', getDoctorsForMap);
router.get('/doctors/nearby', getNearbyDoctors);
router.get('/doctors/:id', getDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Clinic routes
router.post('/clinics', createClinic);
router.get('/clinics', getClinics);
router.get('/clinics/nearby', getNearbyClinics);

// Patient routes
router.post('/patients', createPatient);
router.get('/patients', getPatients);
router.get('/patients/nearby', getPatientsNearLocation);

module.exports = router;
