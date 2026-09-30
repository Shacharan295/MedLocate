const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'medlocate_default_jwt_secret_dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      pharmacyId: user.pharmacyId || null
    },
    secret,
    { expiresIn }
  );
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'medlocate_default_jwt_secret_dev';
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
