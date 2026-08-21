const Candidate = require('../models/Candidate');
const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const { logActivity } = require('../services/auditLogService');
const { assignNextCandidateForRole } = require('../services/candidateAssignmentService');

// @desc    Get Receptionist Desk Dashboard Stats
// @route   GET /api/receptionist/dashboard
// @access  Private (Receptionist, Admin)
const getReceptionistDashboard = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysTotal = await Candidate.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const pendingVerification = await Candidate.countDocuments({
      applicationStatus: 'registered',
      status: 'active',
    });

    const verifiedCount = await Candidate.countDocuments({
      verifiedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const waitingForEmployee = await Candidate.countDocuments({
      assignmentStatus: 'waiting',
      applicationStatus: { $in: ['verified', 'waiting'] },
      status: 'active',
    });

    const interviewsOngoing = await Candidate.countDocuments({
      assignmentStatus: 'ongoing',
      status: 'active',
    });

    const completedToday = await Candidate.countDocuments({
      assignmentStatus: { $in: ['passed', 'failed', 'on_hold'] },
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const pendingCandidates = await Candidate.find({
      applicationStatus: 'registered',
      status: 'active',
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      stats: {
        todaysTotal,
        pendingVerification,
        verifiedCount,
        waitingForEmployee,
        interviewsOngoing,
        completedToday,
      },
      pendingCandidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search Candidate by Enrollment Number or Mobile Number
// @route   GET /api/receptionist/candidates/search
// @access  Private (Receptionist, Admin, HR)
const searchCandidate = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Please provide Enrollment Number or Mobile Number to search.' });
    }

    const cleanQuery = String(query).trim();
    const cleanDigits = cleanQuery.replace(/\D/g, '');

    // Search by enrollmentNumber (case-insensitive) OR mobileNumber / phone / email
    const candidate = await Candidate.findOne({
      $or: [
        { enrollmentNumber: { $regex: `^${cleanQuery}$`, $options: 'i' } },
        ...(cleanDigits.length >= 4 ? [{ mobileNumber: { $regex: cleanDigits, $options: 'i' } }] : []),
        ...(cleanDigits.length >= 4 ? [{ phone: { $regex: cleanDigits, $options: 'i' } }] : []),
        { email: cleanQuery.toLowerCase() },
      ],
      status: 'active',
    }).populate('assignedEmployee', 'name email employeeRoles availabilityStatus');

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate Not Found. We couldn't find a candidate with the provided details. Please verify details or contact Admin.",
      });
    }

    res.json(candidate);
  } catch (error) {
    next(error);
  }
};

// @desc    Receptionist Candidate Verification ("Candidate Is Here")
// @route   POST /api/receptionist/candidates/:id/verify
// @access  Private (Receptionist, Admin)
const verifyCandidatePresence = async (req, res, next) => {
  try {
    const candidateId = req.params.id;
    const receptionistId = req.user._id;

    const candidate = await Candidate.findById(candidateId).populate('assignedEmployee', 'name email employeeRoles availabilityStatus');
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate record not found.' });
    }

    if (candidate.applicationStatus === 'verified' && candidate.verifiedAt) {
      const { autoAssignAllWaitingCandidates } = require('../services/candidateAssignmentService');
      await autoAssignAllWaitingCandidates();

      const reloadedCandidate = await Candidate.findById(candidateId).populate('assignedEmployee', 'name email employeeRoles availabilityStatus');
      const isAssigned = Boolean(reloadedCandidate && reloadedCandidate.assignedEmployee);

      return res.json({
        message: isAssigned
          ? `Candidate '${reloadedCandidate.name}' is verified & assigned to employee ${reloadedCandidate.assignedEmployee.name}!`
          : `Candidate '${reloadedCandidate.name}' is verified & waiting in queue for matching employee availability.`,
        candidate: reloadedCandidate,
        isAssigned,
        assignedEmployee: isAssigned ? reloadedCandidate.assignedEmployee.name : null,
      });
    }

    // Update candidate status upon physical check-in
    candidate.applicationStatus = 'verified';
    candidate.interviewStatus = 'waiting';
    candidate.assignmentStatus = 'waiting';
    candidate.verifiedAt = new Date();
    candidate.verifiedBy = receptionistId;
    await candidate.save();

    // Create CheckIn record
    await CheckIn.create({
      candidate: candidate._id,
      receptionist: receptionistId,
      verifiedAt: candidate.verifiedAt,
      notes: req.body.notes || 'Verified at Reception Desk',
    });

    // Log Activity
    await logActivity({
      user: req.user,
      action: 'RECEPTION_VERIFY_CANDIDATE',
      module: 'RECEPTION',
      description: `Receptionist ${req.user.name} verified presence for candidate ${candidate.name} (${candidate.enrollmentNumber}).`,
      req,
    });

    // Automatically trigger Candidate Assignment Engine for candidate's required role
    let assignmentResult = null;
    try {
      assignmentResult = await assignNextCandidateForRole(candidate.requiredRole, candidate._id);
    } catch (assignErr) {
      console.error('Auto assignment error post-verification:', assignErr.message);
    }

    const isAssigned = Boolean(assignmentResult && assignmentResult.candidate);
    const updatedCandidate = await Candidate.findById(candidate._id).populate('assignedEmployee', 'name email');

    res.json({
      message: isAssigned
        ? `Candidate '${candidate.name}' verified & automatically assigned to employee ${assignmentResult.employee.name}!`
        : `Candidate '${candidate.name}' verified & added to Candidate Queue for matching employee availability.`,
      candidate: updatedCandidate,
      isAssigned,
      assignedEmployee: isAssigned ? assignmentResult.employee.name : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Waiting Queue for Receptionist
// @route   GET /api/receptionist/queue
// @access  Private (Receptionist, Admin, HR)
const getWaitingQueue = async (req, res, next) => {
  try {
    const waitingCandidates = await Candidate.find({
      status: 'active',
      applicationStatus: { $in: ['verified', 'waiting'] },
      assignmentStatus: 'waiting',
    })
      .populate('verifiedBy', 'name')
      .sort({ verifiedAt: 1, createdAt: 1 });

    res.json(waitingCandidates);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Receptionist Check-In History
// @route   GET /api/receptionist/history
// @access  Private (Receptionist, Admin)
const getCheckInHistory = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { receptionist: req.user._id };
    const history = await CheckIn.find(filter)
      .populate('candidate', 'name enrollmentNumber mobileNumber requiredRole position applicationStatus assignmentStatus')
      .populate('receptionist', 'name email')
      .sort({ verifiedAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReceptionistDashboard,
  searchCandidate,
  verifyCandidatePresence,
  getWaitingQueue,
  getCheckInHistory,
};
