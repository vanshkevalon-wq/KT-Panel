const express = require('express');
const router = express.Router();
const {
  submitContactInquiry,
  submitJobApplication,
} = require('../controllers/inquiryController');

router.post('/contact', submitContactInquiry);
router.post('/apply', submitJobApplication);

module.exports = router;
