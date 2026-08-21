const express = require('express');
const router = express.Router();
const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeDashboard,
  getMyCandidates,
  getCurrentInterview,
  getInterviewHistory,
  getEmployeeProfile,
  updateAvailability,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All endpoints protected
router.use(protect);

// Admin-only Employee Management routes
router.get('/admin/list', authorizeRoles('admin'), getEmployees);
router.post('/admin/create', authorizeRoles('admin'), createEmployee);
router.put('/admin/:id', authorizeRoles('admin'), updateEmployee);
router.delete('/admin/:id', authorizeRoles('admin'), deleteEmployee);

// Employee Panel routes
router.get('/dashboard', authorizeRoles('employee', 'admin'), getEmployeeDashboard);
router.get('/my-candidates', authorizeRoles('employee', 'admin'), getMyCandidates);
router.get('/current-interview', authorizeRoles('employee', 'admin'), getCurrentInterview);
router.get('/interview-history', authorizeRoles('employee', 'admin'), getInterviewHistory);
router.get('/profile', authorizeRoles('employee', 'admin'), getEmployeeProfile);
router.put('/availability', authorizeRoles('employee', 'admin'), updateAvailability);

module.exports = router;
