const Doctor = require('../models/doctor.model');
const Clinic = require('../models/clinic.model');
const Patient = require('../models/patient.model');
const Appointment = require('../models/appointment.model');

// Create new doctor
const createDoctor = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.userId;
    const doctorData = {
      ...body,
      userId: req.user._id,
      clinicAddress: body.clinicAddress && (body.clinicAddress.coordinates?.latitude != null || body.clinicAddress.street)
        ? body.clinicAddress
        : { street: body.clinicName || '', city: body.clinicAddress?.city || '', state: body.clinicAddress?.state || '', pincode: body.clinicAddress?.pincode || '' }
    };

    const doctor = new Doctor(doctorData);
    await doctor.save();

    // Notify all users that a new vet doctor was registered
    const notificationService = require('../services/notificationService');
    await notificationService.notifyVetDoctorRegistered(doctor).catch(err => console.error('Notify vet registered:', err));

    res.status(201).json({
      message: 'Doctor profile created successfully',
      doctor
    });

  } catch (error) {
    console.error('Create doctor error:', error);
    const message = error.message || (error.errors && Object.values(error.errors).map(e => e.message).join(', ')) || 'Failed to create doctor profile';
    res.status(500).json({ error: message });
  }
};

// Get all doctors for user
const getDoctors = async (req, res) => {
  try {
    const { specialization, city, state, page = 1, limit = 10 } = req.query;
    
    const query = { userId: req.user._id, isActive: true };
    
    if (specialization) query.specialization = specialization;
    if (city) query['clinicAddress.city'] = new RegExp(city, 'i');
    if (state) query['clinicAddress.state'] = new RegExp(state, 'i');

    const doctors = await Doctor.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// Get doctor by ID
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'name email');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
};

// Update doctor
const updateDoctor = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.userId;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      message: 'Doctor updated successfully',
      doctor
    });

  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });

  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
};

// Get all registered doctors for map (Find Vet page) - returns all active vets with location
const getDoctorsForMap = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select('name specialization clinicName clinicAddress phone consultationFee rating previousWorkPlaceName')
      .lean();
    const list = doctors.map(d => ({
      _id: d._id,
      name: d.name,
      specialization: d.specialization,
      clinicName: d.clinicName,
      address: [d.clinicAddress?.street, d.clinicAddress?.city, d.clinicAddress?.state, d.clinicAddress?.pincode].filter(Boolean).join(', ') || d.clinicName,
      lat: d.clinicAddress?.coordinates?.latitude,
      lng: d.clinicAddress?.coordinates?.longitude,
      phone: d.phone,
      consultationFee: d.consultationFee,
      rating: d.rating,
      previousWorkPlaceName: d.previousWorkPlaceName
    })).filter(d => d.lat != null && d.lng != null);
    res.json({ doctors: list });
  } catch (error) {
    console.error('Get doctors for map error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors for map' });
  }
};

// Get nearby doctors
const getNearbyDoctors = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10, specialization } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    let query = {
      'clinicAddress.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(maxDistance) * 1000
        }
      }
    };

    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email')
      .limit(20);

    res.json({ doctors });

  } catch (error) {
    console.error('Get nearby doctors error:', error);
    res.status(500).json({ error: 'Failed to find nearby doctors' });
  }
};

// Create new clinic
const createClinic = async (req, res) => {
  try {
    const clinicData = {
      ...req.body,
      userId: req.user._id
    };

    const clinic = new Clinic(clinicData);
    await clinic.save();

    res.status(201).json({
      message: 'Clinic created successfully',
      clinic
    });

  } catch (error) {
    console.error('Create clinic error:', error);
    res.status(500).json({ error: 'Failed to create clinic' });
  }
};

// Get all clinics for user
const getClinics = async (req, res) => {
  try {
    const { city, state, type, page = 1, limit = 10 } = req.query;
    
    const query = { userId: req.user._id, isActive: true };
    
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (type) query.type = type;

    const clinics = await Clinic.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Clinic.countDocuments(query);

    res.json({
      clinics,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get clinics error:', error);
    res.status(500).json({ error: 'Failed to fetch clinics' });
  }
};

// Get nearby clinics
const getNearbyClinics = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10, type } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    let query = {
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(maxDistance) * 1000
        }
      }
    };

    if (type) {
      query.type = type;
    }

    const clinics = await Clinic.find(query)
      .populate('userId', 'name email')
      .limit(20);

    res.json({ clinics });

  } catch (error) {
    console.error('Get nearby clinics error:', error);
    res.status(500).json({ error: 'Failed to find nearby clinics' });
  }
};

// Create new patient
const createPatient = async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      userId: req.user._id
    };

    const patient = new Patient(patientData);
    await patient.save();

    res.status(201).json({
      message: 'Patient created successfully',
      patient
    });

  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

// Get all patients for user
const getPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { userId: req.user._id, isActive: true };
    
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': new RegExp(search, 'i') },
        { 'personalInfo.lastName': new RegExp(search, 'i') },
        { 'contact.phone': new RegExp(search, 'i') },
        { 'contact.email': new RegExp(search, 'i') }
      ];
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(query);

    res.json({
      patients,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

// Get patients near location
const getPatientsNearLocation = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const patients = await Patient.findPatientsNearLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(maxDistance)
    );

    res.json({ patients });

  } catch (error) {
    console.error('Get patients near location error:', error);
    res.status(500).json({ error: 'Failed to find patients near location' });
  }
};

module.exports = {
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
};
