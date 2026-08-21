const express = require('express');
const router = express.Router();
const {
  getResults,
  getResultById,
  submitAssessment,
  gradePracticalResult,
} = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Candidate submission endpoint (public/token auth)
router.post('/submit', submitAssessment);

// Protected evaluation & reporting routes
router.get('/', protect, authorizeRoles('admin', 'hr', 'theory', 'practical'), getResults);
router.get('/:id', protect, getResultById);
router.put('/:id/evaluate', protect, authorizeRoles('admin', 'practical', 'hr'), gradePracticalResult);

module.exports = router;
