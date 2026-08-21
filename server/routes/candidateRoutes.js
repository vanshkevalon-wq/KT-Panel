const express = require('express');
const router = express.Router();
const {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  bulkDeleteCandidates,
  importCandidatesFromExcel,
} = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { uploadExcel } = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorizeRoles('admin', 'hr'));

router.route('/').get(getCandidates).post(createCandidate);
router.post('/import-excel', uploadExcel.single('file'), importCandidatesFromExcel);
router.post('/bulk-delete', bulkDeleteCandidates);
router.route('/:id').put(updateCandidate).delete(deleteCandidate);

module.exports = router;
