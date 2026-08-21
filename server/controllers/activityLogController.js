const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs / notifications with search & filters
// @route   GET /api/activity-logs
// @access  Private (All authenticated roles)
const getActivityLogs = async (req, res, next) => {
  try {
    const { search, module: mod, role, unreadOnly } = req.query;
    const query = {};

    // Filter by role/user if not admin
    if (req.user && req.user.role !== 'admin') {
      query.$or = [
        { userRole: req.user.role },
        { userEmail: req.user.email },
        { userRole: 'system' },
        { userRole: 'all' },
      ];
    } else if (role && role !== 'all') {
      query.userRole = role;
    }

    if (mod && mod !== 'all') {
      query.module = mod;
    }

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { description: searchRegex },
        { userEmail: searchRegex },
        { action: searchRegex },
        { module: searchRegex },
      ];
      
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await ActivityLog.countDocuments({ ...query, isRead: false });

    res.json({ logs, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/activity-logs/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const log = await ActivityLog.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!log) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(log);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/activity-logs/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user && req.user.role !== 'admin') {
      filter.$or = [
        { userRole: req.user.role },
        { userEmail: req.user.email },
        { userRole: 'system' },
      ];
    }
    await ActivityLog.updateMany(filter, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear notifications
// @route   DELETE /api/activity-logs/clear
// @access  Private
const clearNotifications = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user && req.user.role !== 'admin') {
      filter.$or = [
        { userRole: req.user.role },
        { userEmail: req.user.email },
      ];
    }
    await ActivityLog.deleteMany(filter);
    res.json({ message: 'Notifications cleared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs,
  markAsRead,
  markAllAsRead,
  clearNotifications,
};

