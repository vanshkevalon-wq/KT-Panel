const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs with search & filters
// @route   GET /api/activity-logs
// @access  Private (Admin)
const getActivityLogs = async (req, res, next) => {
  try {
    const { search, module: mod, role } = req.query;
    const query = {};

    if (mod && mod !== 'all') {
      query.module = mod;
    }

    if (role && role !== 'all') {
      query.userRole = role;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivityLogs };
