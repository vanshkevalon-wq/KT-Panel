const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser);
router.put('/:id/reset-password', resetPassword);

module.exports = router;
