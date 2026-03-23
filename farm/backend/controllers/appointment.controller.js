const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const Clinic = require('../models/clinic.model');
const Patient = require('../models/patient.model');

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      userId: req.user._id
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

// Get all appointments for user
const getAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10, patientId, doctorId } = req.query;
    
    let query = { userId: req.user._id };
    
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    const appointments = await Appointment.find(query)
      .populate('patientId doctorId clinicId')
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get appointment by ID
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('patientId doctorId clinicId');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.userId; // Prevent changing userId

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};

// Get upcoming appointments
const getUpcomingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findUpcomingAppointments(req.user._id, 20);
    
    res.json({ appointments });

  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming appointments' });
  }
};

// Get today's appointments
const getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const appointments = await Appointment.find({
      userId: req.user._id,
      scheduledDate: { $gte: startOfDay, $lt: endOfDay }
    }).populate('patientId doctorId clinicId')
      .sort({ scheduledDate: 1 });

    res.json({ appointments });

  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch today appointments' });
  }
};

// Confirm appointment
const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'Confirmed' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment confirmed successfully',
      appointment
    });

  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({ error: 'Failed to confirm appointment' });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        status: 'Cancelled',
        notes: reason ? `${appointment.notes || ''}\n\nCancelled Reason: ${reason}` : appointment.notes
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

// Complete appointment
const completeAppointment = async (req, res) => {
  try {
    const { prescription, notes, followUpDate } = req.body;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        status: 'Completed',
        prescription,
        notes,
        followUpDate
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment completed successfully',
      appointment
    });

  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
};

// Get appointment statistics
const getAppointmentStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const stats = await Appointment.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          thisMonth: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$scheduledDate', startOfMonth] }, { $lt: ['$scheduledDate', endOfMonth] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      cancelled: 0,
      thisMonth: 0
    };

    res.json(result);

  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ error: 'Failed to get appointment statistics' });
  }
};

module.exports = {
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
};
