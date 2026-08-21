const express = require('express');
const router = express.Router();
const {
  candidateLogin,
  getCandidateProfile,
  getCandidateDashboard,
  getCandidateResult,
  getCandidateNotifications,
} = require('../controllers/candidateAuthController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public candidate login
router.post('/login', candidateLogin);

// Protected candidate routes
router.get('/me', protect, authorizeRoles('candidate'), getCandidateProfile);
router.get('/dashboard', protect, authorizeRoles('candidate'), getCandidateDashboard);
router.get('/profile', protect, authorizeRoles('candidate'), getCandidateProfile);
router.get('/result', protect, authorizeRoles('candidate'), getCandidateResult);
router.get('/notifications', protect, authorizeRoles('candidate'), getCandidateNotifications);

module.exports = router;
