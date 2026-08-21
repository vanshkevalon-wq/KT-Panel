const express = require('express');
const router = express.Router();
const {
  getAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  assignAssessment,
  getAssignments,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/assignments/all', getAssignments);

router
  .route('/')
  .get(getAssessments)
  .post(authorizeRoles('admin', 'theory', 'practical', 'hr'), createAssessment);

router
  .route('/:id')
  .put(authorizeRoles('admin', 'theory', 'practical', 'hr'), updateAssessment)
  .delete(authorizeRoles('admin'), deleteAssessment);

router.post('/:id/assign', authorizeRoles('admin', 'hr'), assignAssessment);

module.exports = router;
