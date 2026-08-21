const express = require('express');
const router = express.Router();
const {
  submitContactInquiry,
  submitJobApplication,
} = require('../controllers/inquiryController');
const { getPublicJobOpenings } = require('../controllers/jobOpeningController');

router.post('/contact', submitContactInquiry);
router.post('/apply', submitJobApplication);
router.get('/job-openings', getPublicJobOpenings);

module.exports = router;
