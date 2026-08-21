const express = require('express');
const router = express.Router();
const {
  startInterviewHandler,
  completeInterviewHandler,
  getCandidateQueue,
  manualAssignHandler,
  getAdminInterviewResults,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

// Employee Interview Actions
router.post('/:id/start', authorizeRoles('employee', 'admin'), startInterviewHandler);
router.post('/:id/complete', authorizeRoles('employee', 'admin'), completeInterviewHandler);

// Admin Queue & Assignment Overrides & Results
router.get('/admin/queue', authorizeRoles('admin', 'hr'), getCandidateQueue);
router.get('/admin/history', authorizeRoles('admin', 'hr'), getAdminInterviewResults);
router.post('/admin/candidates/:id/assign', authorizeRoles('admin'), manualAssignHandler);

module.exports = router;
