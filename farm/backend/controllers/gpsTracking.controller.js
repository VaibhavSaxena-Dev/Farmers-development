const GpsTracking = require('../models/gpsTracking.model');
const Todo = require('../models/todo.model');

// Create new GPS tracking record
const createGpsRecord = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed,
      todoId,
      locationType = 'current',
      address
    } = req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Validate todoId if provided
    if (todoId) {
      const todo = await Todo.findOne({ _id: todoId, userId: req.user._id });
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
    }

    const gpsRecord = new GpsTracking({
      userId: req.user._id,
      latitude,
      longitude,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed,
      todoId,
      locationType,
      address
    });

    await gpsRecord.save();

    res.status(201).json({
      message: 'GPS record created successfully',
      gpsRecord
    });

  } catch (error) {
    console.error('Create GPS record error:', error);
    res.status(500).json({ error: 'Failed to create GPS record' });
  }
};

// Get current location
const getCurrentLocation = async (req, res) => {
  try {
    const currentLocation = await GpsTracking.getCurrentLocation(req.user._id);

    if (!currentLocation) {
      return res.status(404).json({ error: 'No location data found' });
    }

    res.json(currentLocation);

  } catch (error) {
    console.error('Get current location error:', error);
    res.status(500).json({ error: 'Failed to get current location' });
  }
};

// Get location history
const getLocationHistory = async (req, res) => {
  try {
    const {
      limit = 100,
      startDate,
      endDate,
      todoId,
      locationType
    } = req.query;

    const options = {
      limit: parseInt(limit) || 100,
      startDate,
      endDate,
      todoId
    };

    let query = { userId: req.user._id, isActive: true };
    
    if (locationType) {
      query.locationType = locationType;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (todoId) {
      query.todoId = todoId;
    }

    const locationHistory = await GpsTracking.find(query)
      .populate('todoId', 'title description')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit) || 100);

    res.json(locationHistory);

  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({ error: 'Failed to get location history' });
  }
};

// Get nearby locations
const getNearbyLocations = async (req, res) => {
  try {
    const { radiusKm = 5 } = req.query;

    const nearbyLocations = await GpsTracking.getNearbyLocations(
      req.user._id,
      parseFloat(radiusKm)
    );

    res.json(nearbyLocations);

  } catch (error) {
    console.error('Get nearby locations error:', error);
    res.status(500).json({ error: 'Failed to get nearby locations' });
  }
};

// Update GPS record
const updateGpsRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const gpsRecord = await GpsTracking.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!gpsRecord) {
      return res.status(404).json({ error: 'GPS record not found' });
    }

    res.json({
      message: 'GPS record updated successfully',
      gpsRecord
    });

  } catch (error) {
    console.error('Update GPS record error:', error);
    res.status(500).json({ error: 'Failed to update GPS record' });
  }
};

// Delete GPS record
const deleteGpsRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const gpsRecord = await GpsTracking.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!gpsRecord) {
      return res.status(404).json({ error: 'GPS record not found' });
    }

    res.json({ message: 'GPS record deleted successfully' });

  } catch (error) {
    console.error('Delete GPS record error:', error);
    res.status(500).json({ error: 'Failed to delete GPS record' });
  }
};

// Get location statistics
const getLocationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await GpsTracking.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          last24Hours: {
            $sum: {
              $cond: [{ $gte: ['$timestamp', last24Hours] }, 1, 0]
            }
          },
          last7Days: {
            $sum: {
              $cond: [{ $gte: ['$timestamp', last7Days] }, 1, 0]
            }
          },
          uniqueTodos: { $addToSet: '$todoId' }
        }
      },
      {
        $project: {
          totalRecords: 1,
          last24Hours: 1,
          last7Days: 1,
          uniqueTodos: { $size: '$uniqueTodos' }
        }
      }
    ]);

    const result = stats[0] || {
      totalRecords: 0,
      last24Hours: 0,
      last7Days: 0,
      uniqueTodos: 0
    };

    res.json(result);

  } catch (error) {
    console.error('Get location stats error:', error);
    res.status(500).json({ error: 'Failed to get location statistics' });
  }
};

// Check in at a location for a todo
const checkInTodo = async (req, res) => {
  try {
    const { todoId, latitude, longitude, address } = req.body;

    if (!todoId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Todo ID, latitude, and longitude are required' });
    }

    const todo = await Todo.findOne({ _id: todoId, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const gpsRecord = new GpsTracking({
      userId: req.user._id,
      todoId,
      latitude,
      longitude,
      locationType: 'check_in',
      address
    });

    await gpsRecord.save();

    res.status(201).json({
      message: 'Checked in successfully',
      gpsRecord
    });

  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
};

// Check out from a location for a todo
const checkOutTodo = async (req, res) => {
  try {
    const { todoId, latitude, longitude, address } = req.body;

    if (!todoId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Todo ID, latitude, and longitude are required' });
    }

    const todo = await Todo.findOne({ _id: todoId, userId: req.user._id });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const gpsRecord = new GpsTracking({
      userId: req.user._id,
      todoId,
      latitude,
      longitude,
      locationType: 'check_out',
      address
    });

    await gpsRecord.save();

    res.status(201).json({
      message: 'Checked out successfully',
      gpsRecord
    });

  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ error: 'Failed to check out' });
  }
};

module.exports = {
  createGpsRecord,
  getCurrentLocation,
  getLocationHistory,
  getNearbyLocations,
  updateGpsRecord,
  deleteGpsRecord,
  getLocationStats,
  checkInTodo,
  checkOutTodo
};
