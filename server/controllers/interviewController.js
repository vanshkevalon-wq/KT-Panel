const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { logActivity } = require('../services/auditLogService');
const {
  startInterview,
  completeInterview,
  manualAssignCandidate,
} = require('../services/candidateAssignmentService');

// @desc    Start an assigned interview
// @route   POST /api/interviews/:id/start
// @access  Private (Employee)
const startInterviewHandler = async (req, res, next) => {
  try {
    const interviewId = req.params.id;
    const employeeId = req.user._id; // Enforce identity from JWT token (Requirement #39)

    const interview = await startInterview(interviewId, employeeId);

    await logActivity({
      user: req.user,
      action: 'START_INTERVIEW',
      module: 'INTERVIEWS',
      description: `Employee ${req.user.name} started interview for candidate.`,
      req,
    });

    res.json({
      message: 'Interview started successfully.',
      interview,
    });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Complete an interview with result (Pass / Fail / On Hold)
// @route   POST /api/interviews/:id/complete
// @access  Private (Employee)
const completeInterviewHandler = async (req, res, next) => {
  try {
    const interviewId = req.params.id;
    const employeeId = req.user._id; // Enforce identity from JWT token
    const { result, feedback } = req.body;

    if (!['pass', 'fail', 'on_hold'].includes(result)) {
      return res.status(400).json({ message: 'Result must be Pass, Fail, or On Hold.' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview record not found.' });
    }

    if (interview.employee.toString() !== employeeId.toString()) {
      return res.status(403).json({ message: '403 Forbidden: You can only complete your own interview.' });
    }

    const completionResult = await completeInterview(
      interview.candidate,
      employeeId,
      result,
      feedback
    );

    const resultLabel = result === 'pass' ? 'Pass' : result === 'fail' ? 'Fail' : 'On Hold';

    await logActivity({
      user: req.user,
      action: 'COMPLETE_INTERVIEW',
      module: 'INTERVIEWS',
      description: `Employee ${req.user.name} completed interview. Result: ${resultLabel}.`,
      req,
    });

    res.json({
      message: `Interview completed with result '${resultLabel}'.`,
      candidateStatus: completionResult.candidate.assignmentStatus,
      nextAssignment: completionResult.nextAssignment ? completionResult.nextAssignment.candidate : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Candidate Assignment Queue & Monitor
// @route   GET /api/admin/candidate-queue
// @access  Private (Admin, HR)
const getCandidateQueue = async (req, res, next) => {
  try {
    const { role, status, employeeId, search } = req.query;
    const query = {
      // Exclude unverified registered candidates from Candidate Queue until Receptionist check-in!
      applicationStatus: { $in: ['verified', 'waiting', 'assigned', 'ongoing', 'completed'] },
    };

    if (role && role !== 'all') {
      query.requiredRole = { $regex: role, $options: 'i' };
    }

    if (status && status !== 'all') {
      query.assignmentStatus = status;
    }

    if (employeeId && employeeId !== 'all') {
      query.assignedEmployee = employeeId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const candidates = await Candidate.find(query)
      .populate('assignedEmployee', 'name email employeeRoles availabilityStatus')
      .sort({ createdAt: -1 });

    const stats = {
      waiting: await Candidate.countDocuments({
        assignmentStatus: 'waiting',
        applicationStatus: { $in: ['verified', 'waiting'] },
      }),
      assigned: await Candidate.countDocuments({
        assignmentStatus: 'assigned',
        applicationStatus: { $in: ['verified', 'waiting', 'assigned'] },
      }),
      ongoing: await Candidate.countDocuments({ assignmentStatus: 'ongoing' }),
      completed: await Candidate.countDocuments({ assignmentStatus: { $in: ['passed', 'failed', 'on_hold'] } }),
      onHold: await Candidate.countDocuments({ assignmentStatus: 'on_hold' }),
    };

    res.json({ candidates, stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manual assignment / re-assignment override
// @route   POST /api/admin/candidates/:id/assign
// @access  Private (Admin)
const manualAssignHandler = async (req, res, next) => {
  try {
    const candidateId = req.params.id;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Target Employee ID is required.' });
    }

    const result = await manualAssignCandidate(candidateId, employeeId, req.user);

    await logActivity({
      user: req.user,
      action: 'MANUAL_CANDIDATE_ASSIGN',
      module: 'INTERVIEWS',
      description: `Admin manually assigned candidate ${result.candidate.name} to employee ${result.employee.name}.`,
      req,
    });

    res.json({
      message: `Candidate assigned to ${result.employee.name} successfully.`,
      result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all completed interview results for Admin/HR
// @route   GET /api/interviews/admin/history
// @access  Private (Admin, HR)
const getAdminInterviewResults = async (req, res, next) => {
  try {
    const history = await Interview.find({ status: 'completed' })
      .populate('candidate', 'name email position department experience requiredRole assignmentStatus')
      .populate('employee', 'name email employeeRoles')
      .sort({ completedAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterviewHandler,
  completeInterviewHandler,
  getCandidateQueue,
  manualAssignHandler,
  getAdminInterviewResults,
};
