const express = require('express');
const router = express.Router();
const {
  getContactInquiries,
  updateInquiryStatus,
  deleteInquiry,
  getJobApplications,
  updateJobApplicationStatus,
  deleteJobApplication,
} = require('../controllers/inquiryController');
const {
  getAllJobOpenings,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
} = require('../controllers/jobOpeningController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('admin', 'hr'));

// Contact Inquiries
router.get('/inquiries', getContactInquiries);
router.put('/inquiries/:id', updateInquiryStatus);
router.delete('/inquiries/:id', authorizeRoles('admin'), deleteInquiry);

// Job Applications
router.get('/job-applications', getJobApplications);
router.put('/job-applications/:id/status', updateJobApplicationStatus);
router.delete('/job-applications/:id', authorizeRoles('admin'), deleteJobApplication);

// Job Openings Management
router.get('/job-openings', getAllJobOpenings);
router.post('/job-openings', createJobOpening);
router.put('/job-openings/:id', updateJobOpening);
router.delete('/job-openings/:id', authorizeRoles('admin'), deleteJobOpening);

module.exports = router;
