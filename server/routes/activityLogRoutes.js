const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = require('../controllers/activityLogController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getActivityLogs);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/clear', clearNotifications);

module.exports = router;
