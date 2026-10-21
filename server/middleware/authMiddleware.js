const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Malformed authorization token.'
      });
    }

    // Prototype / Demo convenience tokens
    if (token === 'demo-patient-token') {
      const demoUser = await User.findOne({ role: 'patient' });
      if (demoUser) {
        req.user = {
          id: demoUser._id.toString(),
          _id: demoUser._id,
          email: demoUser.email,
          name: demoUser.name,
          role: 'patient',
          pharmacyId: null
        };
        return next();
      }
    }

    if (token === 'demo-pharmacy-token') {
      const demoUser = await User.findOne({ role: 'pharmacy' });
      if (demoUser) {
        req.user = {
          id: demoUser._id.toString(),
          _id: demoUser._id,
          email: demoUser.email,
          name: demoUser.name,
          role: 'pharmacy',
          pharmacyId: demoUser.pharmacyId ? demoUser.pharmacyId.toString() : null
        };
        return next();
      }
    }

    if (token === 'demo-admin-token') {
      const demoUser = await User.findOne({ role: 'admin' });
      if (demoUser) {
        req.user = {
          id: demoUser._id.toString(),
          _id: demoUser._id,
          email: demoUser.email,
          name: demoUser.name,
          role: 'admin',
          pharmacyId: null
        };
        return next();
      }
    }

    const decoded = verifyToken(token);
    
    // Optional fresh user lookup to ensure account is still active
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists.'
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      pharmacyId: user.pharmacyId ? user.pharmacyId.toString() : null
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token.'
    });
  }
};

module.exports = { authenticateToken };
