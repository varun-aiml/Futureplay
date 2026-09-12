const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/emailService");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user (automatically verified)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      isEmailVerified: true,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.otp = undefined; // Clear OTP after verification
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Private
exports.resendOTP = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail({
        name: user.name,
        email: user.email,
        otp,
      });
    } catch (error) {
      console.error("Email sending error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during OTP resend",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email and include password in the result
    const user = await User.findOne({ email }).select("+password");

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add this to your existing authcontroller.js file

// @desc    Complete user profile after Google signup
// @route   POST /api/auth/complete-profile
// @access  Private
exports.completeProfile = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user profile
    user.phone = phone;
    user.profileComplete = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    console.error("Profile completion error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile completion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create umpire account by Organizer
// @route   POST /api/auth/umpire
// @access  Private (Organizer only)
exports.createUmpire = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide umpire name, email/username, and password"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user or umpire with this email/username already exists"
      });
    }

    const umpire = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'umpire',
      createdByOrganizer: req.user._id,
      isEmailVerified: true,
      profileComplete: true
    });

    umpire.password = undefined;

    res.status(201).json({
      success: true,
      message: "Umpire account created successfully",
      umpire: {
        _id: umpire._id,
        name: umpire.name,
        email: umpire.email,
        role: umpire.role,
        createdByOrganizer: umpire.createdByOrganizer,
        createdAt: umpire.createdAt
      }
    });
  } catch (error) {
    console.error("Create umpire error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating umpire account",
      error: error.message
    });
  }
};

// @desc    Get all umpires created by the logged-in Organizer
// @route   GET /api/auth/umpire
// @access  Private (Organizer only, or umpire in organizer scope)
exports.getOrganizerUmpires = async (req, res) => {
  try {
    // Resolve organizer ID:
    // If the authenticated caller is an umpire, scope to the organizer that created them.
    // If the authenticated caller is an organizer, scope to their own ID.
    let organizerId = (req.user.role === 'umpire' && req.user.createdByOrganizer)
      ? req.user.createdByOrganizer
      : req.user._id;

    // If a tournamentId query parameter is provided, verify tournament organizer context
    if (req.query && req.query.tournamentId) {
      try {
        const Tournament = require('../models/Tournament');
        const tournament = await Tournament.findById(req.query.tournamentId);
        if (tournament && tournament.organizer) {
          const isOwner = tournament.organizer.toString() === req.user._id.toString();
          const isCreatedByOwner = req.user.createdByOrganizer && req.user.createdByOrganizer.toString() === tournament.organizer.toString();
          if (isOwner || isCreatedByOwner) {
            organizerId = tournament.organizer;
          }
        }
      } catch (tournErr) {
        console.warn("Tournament lookup error in getOrganizerUmpires:", tournErr.message);
      }
    }

    const umpires = await User.find({
      $or: [
        { createdByOrganizer: organizerId },
        { createdByOrganizer: organizerId.toString() }
      ],
      role: 'umpire'
    }).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: umpires.length,
      umpires
    });
  } catch (error) {
    console.error("Get umpires error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching umpires",
      error: error.message
    });
  }
};

// @desc    Umpire Login with organizer-provided credentials
// @route   POST /api/auth/umpire/login
// @access  Public
exports.umpireLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/username and password"
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials"
      });
    }

    if (user.role !== 'umpire') {
      return res.status(403).json({
        success: false,
        message: "Access restricted: This account is not authorized as an umpire"
      });
    }

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Umpire login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdByOrganizer: user.createdByOrganizer
      }
    });
  } catch (error) {
    console.error("Umpire login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during umpire login",
      error: error.message
    });
  }
};

// Make sure to export the generateToken function
exports.generateToken = generateToken;
