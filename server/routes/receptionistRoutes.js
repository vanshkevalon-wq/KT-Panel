const express = require('express');
const router = express.Router();
const {
  getReceptionistDashboard,
  searchCandidate,
  verifyCandidatePresence,
  getWaitingQueue,
  getCheckInHistory,
} = require('../controllers/receptionistController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/dashboard', authorizeRoles('receptionist', 'admin'), getReceptionistDashboard);
router.get('/candidates/search', authorizeRoles('receptionist', 'admin', 'hr'), searchCandidate);
router.post('/candidates/:id/verify', authorizeRoles('receptionist', 'admin'), verifyCandidatePresence);
router.get('/queue', authorizeRoles('receptionist', 'admin', 'hr'), getWaitingQueue);
router.get('/history', authorizeRoles('receptionist', 'admin'), getCheckInHistory);

module.exports = router;
