const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const { generateToken } = require('../utils/jwt');

/**
 * @route   POST /api/auth/register
 * @desc    Register a patient, pharmacy, or admin
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'patient', pharmacyDetails } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and phone.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = await User.hashPassword(password);

    // Create User record
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role
    });

    // If registering as a pharmacy, create pharmacy document and link
    if (role === 'pharmacy') {
      const { pharmacyName, address, phone: phPhone, latitude, longitude } = pharmacyDetails || req.body;

      if (!pharmacyName || !address) {
        return res.status(400).json({
          success: false,
          message: 'Pharmacy registration requires pharmacy name and address.'
        });
      }

      // Default to Chennai coordinates if none provided
      const lat = parseFloat(latitude) || 13.0827;
      const lng = parseFloat(longitude) || 80.2707;

      const pharmacy = await Pharmacy.create({
        ownerId: user._id,
        name: pharmacyName,
        address,
        phone: phPhone || phone,
        location: {
          type: 'Point',
          coordinates: [lng, lat] // [longitude, latitude] GeoJSON
        },
        verified: false // Admin must verify
      });

      user.pharmacyId = pharmacy._id;
    }

    await user.save();

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacyId: user.pharmacyId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    let pharmacyData = null;
    if (user.role === 'pharmacy' && user.pharmacyId) {
      pharmacyData = await Pharmacy.findById(user.pharmacyId);
    }

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacyId: user.pharmacyId,
        pharmacy: pharmacyData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    let pharmacy = null;
    if (user.role === 'pharmacy' && user.pharmacyId) {
      pharmacy = await Pharmacy.findById(user.pharmacyId);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        pharmacyId: user.pharmacyId,
        pharmacy
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
