const User = require('../models/user.model');
const { generateToken } = require('../middleware/auth');

// Register new user
const register = async (req, res) => {
  try {
    const { phone, email, password, name } = req.body;

    // Validate input
    if (!phone || !name) {
      return res.status(400).json({ error: 'Phone and name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this phone number' });
    }

    // Create new user
    const user = new User({
      phone,
      email,
      pwdHash: password || '',
      name
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    // Find user by phone or email
    const user = await User.findOne({ $or: [{ phone }, { email }] });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password if provided
    if (password && user.pwdHash) {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        phone: req.user.phone,
        email: req.user.email,
        name: req.user.name,
        preferences: req.user.preferences
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const { voiceEnabled, notificationsEnabled, voiceLanguage } = req.body;

    const updateData = {};
    if (voiceEnabled !== undefined) updateData['preferences.voiceEnabled'] = voiceEnabled;
    if (notificationsEnabled !== undefined) updateData['preferences.notificationsEnabled'] = notificationsEnabled;
    if (voiceLanguage !== undefined) updateData['preferences.voiceLanguage'] = voiceLanguage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      message: 'Preferences updated successfully',
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.pwdHash = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updatePreferences,
  changePassword
};
