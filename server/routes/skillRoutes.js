const express = require('express');
const router = express.Router();
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getSkills);
router.post('/', authorizeRoles('admin'), createSkill);
router.put('/:id', authorizeRoles('admin'), updateSkill);
router.delete('/:id', authorizeRoles('admin'), deleteSkill);

module.exports = router;
