const Candidate = require('../models/Candidate');
const { logActivity } = require('../services/auditLogService');
const { assignNextCandidateForRole } = require('../services/candidateAssignmentService');
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
  requiredRole: [
    'requiredrole',
    'requiredskill',
    'skill',
    'skills',
    'appliedfor',
    'roleapplied',
    'targetrole',
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
      else if (norm.includes('role') || norm.includes('skill') || norm.includes('applied')) matchedField = 'requiredRole';
      else if (norm.includes('title') || norm.includes('designation') || norm.includes('position') || norm.includes('post')) matchedField = 'position';
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
    const { search, department, status, role } = req.query;
    const query = {};

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (role && role !== 'all') {
      query.requiredRole = { $regex: role, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { requiredRole: { $regex: search, $options: 'i' } },
      ];
    }

    const candidates = await Candidate.find(query)
      .populate('assignedEmployee', 'name email employeeRoles availabilityStatus')
      .sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to auto-generate unique Enrollment Number (e.g. KT202600001)
 */
const generateEnrollmentNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `KT${currentYear}`;

  const lastCandidate = await Candidate.findOne({
    enrollmentNumber: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let nextSeq = 1;
  if (lastCandidate && lastCandidate.enrollmentNumber) {
    const numPart = lastCandidate.enrollmentNumber.replace(prefix, '');
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextSeq = parsed + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
};

// @desc    Create candidate manually
// @route   POST /api/candidates
// @access  Private (Admin, HR)
const createCandidate = async (req, res, next) => {
  try {
    const {
      enrollmentNumber,
      name,
      email,
      phone,
      mobileNumber,
      position,
      department,
      experience,
      status,
      requiredRole,
      gender,
      dob,
      education,
      city,
      address,
      source,
      notes,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Candidate name and email are required.' });
    }

    const existingCandidate = await Candidate.findOne({ email: email.toLowerCase().trim() });
    if (existingCandidate) {
      return res.status(400).json({ message: `Candidate with email '${email}' already exists.` });
    }

    // Determine final enrollment number
    let finalEnrollment = enrollmentNumber ? String(enrollmentNumber).trim().toUpperCase() : null;
    if (finalEnrollment) {
      const existingEnroll = await Candidate.findOne({ enrollmentNumber: finalEnrollment });
      if (existingEnroll) {
        return res.status(400).json({ message: `Enrollment number '${finalEnrollment}' is already assigned to another candidate.` });
      }
    } else {
      finalEnrollment = await generateEnrollmentNumber();
    }

    const effectiveRole = (requiredRole || position || 'uiux').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const effectiveMobile = mobileNumber || phone || '';

    const candidate = await Candidate.create({
      enrollmentNumber: finalEnrollment,
      name,
      email: email.toLowerCase().trim(),
      phone: phone || effectiveMobile,
      mobileNumber: effectiveMobile,
      position: position || 'Developer',
      requiredRole: effectiveRole,
      department: department || 'Engineering',
      experience: experience || '1 Year',
      status: status || 'active',
      applicationStatus: 'registered',
      interviewStatus: 'waiting',
      assignmentStatus: 'unverified',
      gender,
      dob,
      education,
      city,
      address,
      source,
      notes,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_CANDIDATE',
      module: 'CANDIDATE_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} user created candidate ${candidate.name} (Enrollment: ${candidate.enrollmentNumber}, Role: ${candidate.requiredRole}).`,
      req,
    });

    const responseData = await Candidate.findById(candidate._id).populate(
      'assignedEmployee',
      'name email availabilityStatus'
    );

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private (Admin, HR)
const updateCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, position, department, experience, status, requiredRole, assignmentStatus } = req.body;
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (name) candidate.name = name;
    if (email) candidate.email = email;
    if (phone !== undefined) candidate.phone = phone;
    if (position) candidate.position = position;
    if (requiredRole) {
      candidate.requiredRole = requiredRole.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    if (department) candidate.department = department;
    if (experience !== undefined) candidate.experience = experience;
    if (status) candidate.status = status;
    if (assignmentStatus) candidate.assignmentStatus = assignmentStatus;

    await candidate.save();

    // If candidate became waiting or role updated, attempt assignment
    if (candidate.assignmentStatus === 'waiting' && !candidate.assignedEmployee) {
      try {
        await assignNextCandidateForRole(candidate.requiredRole);
      } catch (e) {
        // ignore
      }
    }

    await logActivity({
      user: req.user,
      action: 'UPDATE_CANDIDATE',
      module: 'CANDIDATE_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} user updated candidate ${candidate.name}.`,
      req,
    });

    const updated = await Candidate.findById(candidate._id).populate(
      'assignedEmployee',
      'name email availabilityStatus'
    );

    res.json(updated);
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
      let requiredRole = colMapping.requiredRole ? String(row[colMapping.requiredRole] || '').trim() : '';
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

      const effectiveRole = (requiredRole || position || 'uiux').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      const newCand = await Candidate.create({
        name,
        email,
        phone: phone || '',
        position: position || 'Developer',
        requiredRole: effectiveRole,
        department: department || 'Engineering',
        experience: experience || '1 Year',
        status,
        assignmentStatus: 'waiting',
        createdBy: req.user._id,
      });

      // Attempt automatic assignment
      try {
        await assignNextCandidateForRole(effectiveRole);
      } catch (assignError) {
        // ignore
      }

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

const User = require('../models/User');

// @desc    Get all Receptionist users
// @route   GET /api/admin/receptionists
// @access  Private (Admin)
const getReceptionists = async (req, res, next) => {
  try {
    const receptionists = await User.find({ role: 'receptionist' }).sort({ createdAt: -1 });
    res.json(receptionists);
  } catch (error) {
    next(error);
  }
};

// @desc    Create Receptionist user
// @route   POST /api/admin/receptionists
// @access  Private (Admin)
const createReceptionist = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: `User with email '${email}' already exists.` });
    }

    const receptionist = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'receptionist',
      isActive: true,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_RECEPTIONIST',
      module: 'USER_MANAGEMENT',
      description: `Admin created receptionist user account ${receptionist.name} (${receptionist.email}).`,
      req,
    });

    res.status(201).json({
      _id: receptionist._id,
      name: receptionist.name,
      email: receptionist.email,
      role: receptionist.role,
      isActive: receptionist.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Receptionist user
// @route   PUT /api/admin/receptionists/:id
// @access  Private (Admin)
const updateReceptionist = async (req, res, next) => {
  try {
    const { name, email, isActive, password } = req.body;
    const receptionist = await User.findOne({ _id: req.params.id, role: 'receptionist' });

    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist user not found.' });
    }

    if (name) receptionist.name = name;
    if (email) receptionist.email = email.toLowerCase().trim();
    if (isActive !== undefined) receptionist.isActive = isActive;
    if (password) receptionist.password = password;

    await receptionist.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE_RECEPTIONIST',
      module: 'USER_MANAGEMENT',
      description: `Admin updated receptionist user ${receptionist.name}.`,
      req,
    });

    res.json({
      _id: receptionist._id,
      name: receptionist.name,
      email: receptionist.email,
      role: receptionist.role,
      isActive: receptionist.isActive,
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
  getReceptionists,
  createReceptionist,
  updateReceptionist,
};
