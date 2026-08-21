const express = require('express');
const router = express.Router();
const {
  getPracticalQuestions,
  createPracticalQuestion,
  updatePracticalQuestion,
  deletePracticalQuestion,
  getPracticalCategories,
} = require('../controllers/practicalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/categories', getPracticalCategories);

router
  .route('/questions')
  .get(getPracticalQuestions)
  .post(authorizeRoles('admin', 'practical'), createPracticalQuestion);

router
  .route('/questions/:id')
  .put(authorizeRoles('admin', 'practical'), updatePracticalQuestion)
  .delete(authorizeRoles('admin', 'practical'), deletePracticalQuestion);

module.exports = router;
