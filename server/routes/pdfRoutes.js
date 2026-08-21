const express = require('express');
const router = express.Router();
const { importPdf, confirmImport } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { uploadPdf } = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorizeRoles('admin', 'theory', 'practical'));

router.post('/import-pdf', uploadPdf.single('file'), importPdf);
router.post('/import-confirm', confirmImport);

module.exports = router;
