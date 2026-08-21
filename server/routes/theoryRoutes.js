const express = require('express');
const router = express.Router();
const {
  getTheoryQuestions,
  createTheoryQuestion,
  updateTheoryQuestion,
  deleteTheoryQuestion,
  getTheoryCategories,
} = require('../controllers/theoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/categories', getTheoryCategories);

router
  .route('/questions')
  .get(getTheoryQuestions)
  .post(authorizeRoles('admin', 'theory'), createTheoryQuestion);

router
  .route('/questions/:id')
  .put(authorizeRoles('admin', 'theory'), updateTheoryQuestion)
  .delete(authorizeRoles('admin', 'theory'), deleteTheoryQuestion);

module.exports = router;
