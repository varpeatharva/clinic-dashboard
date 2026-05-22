const User = require('../models/User');
const { sendResponse } = require('../utils/apiResponse');

// @desc  Get all users (staff management)
// @route GET /api/users
// @access Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 'staff'] } }).select('-password').sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Users fetched.', users);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Create user (by admin)
// @route POST /api/users
// @access Private (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return sendResponse(res, 400, false, 'Name, email, and password are required.');
    }
    const existing = await User.findOne({ email });
    if (existing) return sendResponse(res, 409, false, 'Email already in use.');
    const user = await User.create({ name, email, password, role: role || 'staff' });
    return sendResponse(res, 201, true, 'User created.', {
      _id: user._id, name: user.name, email: user.email, role: user.role,
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Update user
// @route PUT /api/users/:id
// @access Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true }).select('-password');
    if (!user) return sendResponse(res, 404, false, 'User not found.');
    return sendResponse(res, 200, true, 'User updated.', user);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Delete user
// @route DELETE /api/users/:id
// @access Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    // Prevent deleting own account
    if (req.params.id === req.user._id.toString()) {
      return sendResponse(res, 400, false, 'You cannot delete your own account.');
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'User not found.');
    return sendResponse(res, 200, true, 'User deleted.');
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
