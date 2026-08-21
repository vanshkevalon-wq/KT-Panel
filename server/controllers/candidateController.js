const Candidate = require('../models/Candidate');
const { logActivity } = require('../services/auditLogService');
const xlsx = require('xlsx');
const fs = require('fs');

// Normalize column header string to simple lowercase alphanumeric
const normalizeHeader = (header) => {
  return String(header || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

// Synonym lists for intelligent column matching
const SYNONYMS = {
  name: [
    'name',
    'candidatename',
    'fullname',
    'studentname',
    'applicantname',
    'personname',
    'user',
    'username',
    'nme',
    'applicant',
    'candidate',
    'firstfullname',
    'fname',
  ],
  email: [
    'email',
    'emailaddress',
    'mail',
    'mailid',
    'emailid',
    'useremail',
    'candidateemail',
    'contactemail',
    'emailaddressid',
  ],
  phone: [
    'phone',
    'phonenumber',
    'mobile',
    'mobilenumber',
    'contact',
    'contactnumber',
    'contactno',
    'cell',
    'cellnumber',
    'telephone',
    'phoneno',
    'mobileno',
    'num',
    'number',
  ],
  position: [
    'position',
    'role',
    'jobtitle',
    'title',
    'designation',
    'jobrole',
    'applyingposition',
    'job',
    'post',
    'profile',
    'jobposition',
  ],
  department: [
    'department',
    'dept',
    'division',
    'branch',
    'team',
    'stream',
    'field',
    'sector',
  ],
  experience: [
    'experience',
    'exp',
    'totalexp',
    'totalexperience',
    'workexp',
    'workexperience',
    'years',
    'yearsofexperience',
    'yrsexp',
    'yr',
  ],
  status: [
    'status',
    'activestatus',
    'candidatestatus',
    'state',
    'active',
  ],
};

/**
 * Detect column mapping from raw headers
 */
const detectColumnMapping = (headers) => {
  const mapping = {};

  for (const rawHeader of headers) {
    const norm = normalizeHeader(rawHeader);
    if (!norm) continue;

    // Check exact synonyms
    let matchedField = null;
    for (const [field, syns] of Object.entries(SYNONYMS)) {
      if (syns.includes(norm)) {
        matchedField = field;
        break;
      }
    }

    // Fallback partial matching
    if (!matchedField) {
      if (norm.includes('name')) matchedField = 'name';
      else if (norm.includes('mail')) matchedField = 'email';
      else if (norm.includes('phone') || norm.includes('mobile') || norm.includes('contact')) matchedField = 'phone';
      else if (norm.includes('role') || norm.includes('title') || norm.includes('designation') || norm.includes('position') || norm.includes('post')) matchedField = 'position';
      else if (norm.includes('dept') || norm.includes('division') || norm.includes('branch')) matchedField = 'department';
      else if (norm.includes('exp') || norm.includes('year')) matchedField = 'experience';
      else if (norm.includes('status') || norm.includes('state')) matchedField = 'status';
    }

    if (matchedField && !mapping[matchedField]) {
      mapping[matchedField] = rawHeader;
    }
  }

  return mapping;
};

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private (Admin, HR)
const getCandidates = async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    next(error);
  }
};

// @desc    Create candidate manually
// @route   POST /api/candidates
// @access  Private (Admin, HR)
const createCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, position, department, experience, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Candidate name and email are required.' });
    }

    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ message: `Candidate with email '${email}' already exists.` });
    }

    const candidate = await Candidate.create({
      name,
      email,
      phone,
      position: position || 'Developer',
      department: department || 'Engineering',
      experience: experience || '1 Year',
      status: status || 'active',
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_CANDIDATE',
      module: 'CANDIDATE_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} user created candidate ${candidate.name} (${candidate.position}).`,
      req,
    });

    res.status(201).json(candidate);
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private (Admin, HR)
const updateCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, position, department, experience, status } = req.body;
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (name) candidate.name = name;
    if (email) candidate.email = email;
    if (phone !== undefined) candidate.phone = phone;
    if (position) candidate.position = position;
    if (department) candidate.department = department;
    if (experience !== undefined) candidate.experience = experience;
    if (status) candidate.status = status;

    await candidate.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE_CANDIDATE',
      module: 'CANDIDATE_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} user updated candidate ${candidate.name}.`,
      req,
    });

    res.json(candidate);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single candidate
// @route   DELETE /api/candidates/:id
// @access  Private (Admin, HR)
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    await Candidate.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'DELETE_CANDIDATE',
      module: 'CANDIDATE_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} user deleted candidate ${candidate.name} (${candidate.email}).`,
      req,
    });

    res.json({ message: `Candidate '${candidate.name}' deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete candidates
// @route   POST /api/candidates/bulk-delete
// @access  Private (Admin, HR)
const bulkDeleteCandidates = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please select candidates to delete.' });
    }

    const deleteResult = await Candidate.deleteMany({ _id: { $in: ids } });

    await logActivity({
      user: req.user,
      action: 'BULK_DELETE_CANDIDATES',
      module: 'CANDIDATE_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} user bulk deleted ${deleteResult.deletedCount} candidates.`,
      req,
    });

    res.json({
      message: `Successfully deleted ${deleteResult.deletedCount} candidate(s).`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import candidates from uploaded Excel/CSV sheet (Any column format supported!)
// @route   POST /api/candidates/import-excel
// @access  Private (Admin, HR)
const importCandidatesFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a valid .xlsx, .xls, or .csv file.' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON array
    const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ message: 'The uploaded Excel file contains no data rows.' });
    }

    // Extract all column headers from first row
    const rawHeaders = Object.keys(rawRows[0] || {});
    const colMapping = detectColumnMapping(rawHeaders);

    const importedCandidates = [];
    const skippedRows = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];

      // Extract values using detected mapping or content inspection
      let name = colMapping.name ? String(row[colMapping.name] || '').trim() : '';
      let email = colMapping.email ? String(row[colMapping.email] || '').trim().toLowerCase() : '';
      let phone = colMapping.phone ? String(row[colMapping.phone] || '').trim() : '';
      let position = colMapping.position ? String(row[colMapping.position] || '').trim() : '';
      let department = colMapping.department ? String(row[colMapping.department] || '').trim() : '';
      let experience = colMapping.experience ? String(row[colMapping.experience] || '').trim() : '';
      let statusRaw = colMapping.status ? String(row[colMapping.status] || '').trim().toLowerCase() : '';

      // Smart content-based fallback for email & phone if column header wasn't named properly
      if (!email || !email.includes('@')) {
        for (const [key, val] of Object.entries(row)) {
          const strVal = String(val).trim();
          if (strVal.includes('@') && strVal.includes('.')) {
            email = strVal.toLowerCase();
            break;
          }
        }
      }

      if (!name) {
        // Fallback: pick first non-email text cell in row
        for (const [key, val] of Object.entries(row)) {
          const strVal = String(val).trim();
          if (strVal && !strVal.includes('@') && isNaN(Number(strVal))) {
            name = strVal;
            break;
          }
        }
      }

      if (!phone) {
        // Fallback: look for cell with 8-12 digits
        for (const [key, val] of Object.entries(row)) {
          const strVal = String(val).replace(/[^0-9\+]/g, '');
          if (strVal.length >= 8 && strVal.length <= 15) {
            phone = strVal;
            break;
          }
        }
      }

      const status = statusRaw === 'inactive' ? 'inactive' : 'active';

      if (!name || !email) {
        skippedRows.push({ row: i + 2, reason: 'Could not extract valid Name or Email from row.' });
        continue;
      }

      // Check if email already exists in DB
      const exists = await Candidate.findOne({ email });
      if (exists) {
        skippedRows.push({ row: i + 2, email, reason: `Candidate with email '${email}' already exists.` });
        continue;
      }

      const newCand = await Candidate.create({
        name,
        email,
        phone: phone || '',
        position: position || 'Developer',
        department: department || 'Engineering',
        experience: experience || '1 Year',
        status,
        createdBy: req.user._id,
      });

      importedCandidates.push(newCand);
    }

    // Clean up uploaded temp file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // ignore
    }

    await logActivity({
      user: req.user,
      action: 'IMPORT_CANDIDATES_EXCEL',
      module: 'CANDIDATE_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} user imported ${importedCandidates.length} candidates from Excel sheet (${req.file.originalname}).`,
      req,
    });

    res.status(201).json({
      message: `Successfully imported ${importedCandidates.length} candidate(s).`,
      importedCount: importedCandidates.length,
      skippedCount: skippedRows.length,
      skippedDetails: skippedRows,
      detectedColumns: colMapping,
      candidates: importedCandidates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  bulkDeleteCandidates,
  importCandidatesFromExcel,
};
