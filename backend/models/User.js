const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: function(){
      return !this.googleId;
    },
    trim: true
  },
  password: {
    type: String,
    required: function(){
      return !this.googleId;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password in queries by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['organizer', 'player', 'admin'],
    default: 'organizer'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiry (10 minutes)
  this.otp = {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  };
  
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(code) {
  return this.otp.code === code && this.otp.expiresAt > Date.now();
};

const User = mongoose.model('User', userSchema);

module.exports = User;