const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  pwdHash: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  preferences: {
    voiceEnabled: {
      type: Boolean,
      default: true
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    voiceLanguage: {
      type: String,
      default: 'en-US'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('pwdHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.pwdHash = await bcrypt.hash(this.pwdHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.pwdHash);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.pwdHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
