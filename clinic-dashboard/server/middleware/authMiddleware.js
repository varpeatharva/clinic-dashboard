const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResponse } = require('../utils/apiResponse');

// Protect routes — verify JWT from httpOnly cookie
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized. Please log in.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return sendResponse(res, 401, false, 'User not found. Please log in again.');
    }

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid or expired token. Please log in again.');
  }
};

// Admin-only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return sendResponse(res, 403, false, 'Access denied. Admin privileges required.');
};

// Staff and Admin access (No patients)
const staffOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    return next();
  }
  return sendResponse(res, 403, false, 'Access denied. Clinic staff privileges required.');
};

module.exports = { protect, adminOnly, staffOnly };
