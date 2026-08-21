const User = require('../models/User');
const { logActivity } = require('../services/auditLogService');

// @desc    Get all users with search and filter
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, customPermissions } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const validRoles = ['admin', 'hr', 'theory', 'practical'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid user role specified' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Kevalon@123',
      role,
      customPermissions: customPermissions || [],
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_USER',
      module: 'USER_MANAGEMENT',
      description: `Admin created user ${user.email} with role '${user.role}'.`,
      req,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      customPermissions: user.customPermissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive, customPermissions } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (Array.isArray(customPermissions)) user.customPermissions = customPermissions;

    await user.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE_USER',
      module: 'USER_MANAGEMENT',
      description: `Admin updated user details for ${user.email}.`,
      req,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      customPermissions: user.customPermissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword || 'Kevalon@123';
    await user.save();

    await logActivity({
      user: req.user,
      action: 'RESET_PASSWORD',
      module: 'USER_MANAGEMENT',
      description: `Admin reset password for user ${user.email}.`,
      req,
    });

    res.json({ message: `Password reset successfully for ${user.email}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete their own active account.' });
    }

    user.isActive = false;
    await user.save();

    await logActivity({
      user: req.user,
      action: 'DEACTIVATE_USER',
      module: 'USER_MANAGEMENT',
      description: `Admin deactivated user ${user.email}.`,
      req,
    });

    res.json({ message: `User ${user.email} deactivated successfully.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
};
