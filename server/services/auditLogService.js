const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity in system
 */
const logActivity = async ({ user, action, module, description, req = null }) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1'
      : '127.0.0.1';

    await ActivityLog.create({
      user: user?._id || null,
      userEmail: user?.email || 'system@kevalontechnology.in',
      userRole: user?.role || 'system',
      action,
      module,
      description,
      ipAddress: String(ipAddress),
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

module.exports = { logActivity };
