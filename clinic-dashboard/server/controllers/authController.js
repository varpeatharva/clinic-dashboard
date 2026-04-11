const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { sendResponse } = require('../utils/apiResponse');

// Generate JWT and set httpOnly cookie
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  return token;
};

// @desc  Register new user
// @route POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendResponse(res, 400, false, 'Please provide name, email, and password.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 409, false, 'Email already registered.');
    }

    const finalRole = role || 'patient';
    let patientRef = null;

    if (finalRole === 'patient') {
      const lastPatient = await Patient.findOne().sort({ patient_id: -1 });
      const patient_id = lastPatient ? lastPatient.patient_id + 1 : 1;
      
      const newPatient = await Patient.create({
        patient_id,
        name,
        email,
      });
      patientRef = newPatient._id;
    }

    const user = await User.create({ name, email, password, role: finalRole, patient_ref: patientRef });
    generateToken(res, user._id);

    return sendResponse(res, 201, true, 'Registration successful.', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      patient_ref: user.patient_ref,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Please provide email and password.');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return sendResponse(res, 401, false, 'Invalid email or password.');
    }

    generateToken(res, user._id);

    return sendResponse(res, 200, true, 'Login successful.', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      patient_ref: user.patient_ref,
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Logout user
// @route POST /api/auth/logout
// @access Private
const logout = (req, res) => {
  res.cookie('token', '', { 
    httpOnly: true, 
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  });
  return sendResponse(res, 200, true, 'Logged out successfully.');
};

// @desc  Get current user
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  return sendResponse(res, 200, true, 'User profile fetched.', req.user);
};

module.exports = { register, login, logout, getMe };
