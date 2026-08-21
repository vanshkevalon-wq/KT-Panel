const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const { logActivity } = require('../services/auditLogService');

const generateToken = (id) => {
  return jwt.sign(
    { id, role: 'candidate' },
    process.env.JWT_SECRET || 'kevalon_super_secret_jwt_key_2026_production',
    { expiresIn: '30d' }
  );
};

// @desc    Candidate login using Enrollment Number + Mobile Number
// @route   POST /api/candidate/login
// @access  Public
const candidateLogin = async (req, res, next) => {
  try {
    const { enrollmentNumber, mobileNumber } = req.body;

    if (!enrollmentNumber || !mobileNumber) {
      return res.status(400).json({
        message: 'Enrollment number or mobile number is incorrect. Please check your details and try again.',
      });
    }

    const cleanEnroll = String(enrollmentNumber).trim().toUpperCase();
    const cleanMobile = String(mobileNumber).trim().replace(/\D/g, '');

    // Search candidate by enrollmentNumber + mobileNumber / phone
    const candidate = await Candidate.findOne({
      enrollmentNumber: cleanEnroll,
      status: 'active',
    });

    if (!candidate) {
      return res.status(401).json({
        message: 'Enrollment number or mobile number is incorrect. Please check your details and try again.',
      });
    }

    // Verify mobile number matches mobileNumber or phone
    const candMobile = String(candidate.mobileNumber || candidate.phone || '').replace(/\D/g, '');
    
    // Support matching trailing 10 digits
    const mobileMatches = candMobile.endsWith(cleanMobile) || cleanMobile.endsWith(candMobile);

    if (!mobileMatches) {
      return res.status(401).json({
        message: 'Enrollment number or mobile number is incorrect. Please check your details and try again.',
      });
    }

    const token = generateToken(candidate._id);

    res.json({
      token,
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        enrollmentNumber: candidate.enrollmentNumber,
        mobileNumber: candidate.mobileNumber || candidate.phone,
        requiredRole: candidate.requiredRole,
        position: candidate.position,
        department: candidate.department,
        applicationStatus: candidate.applicationStatus,
        interviewStatus: candidate.interviewStatus,
        result: candidate.result,
        resultPublished: candidate.resultPublished,
        createdAt: candidate.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in candidate profile
// @route   GET /api/candidate/me
// @access  Private (Candidate)
const getCandidateProfile = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.user._id).select(
      'enrollmentNumber name email phone mobileNumber position department experience requiredRole applicationStatus interviewStatus result resultPublished gender dob education city address createdAt'
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found.' });
    }

    res.json(candidate);
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate dashboard & timeline info
// @route   GET /api/candidate/dashboard
// @access  Private (Candidate)
const getCandidateDashboard = async (req, res, next) => {
  try {
    let candidate = await Candidate.findById(req.user._id).select(
      'enrollmentNumber name position department requiredRole applicationStatus interviewStatus assignmentStatus result resultPublished verifiedAt createdAt updatedAt'
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate record not found.' });
    }

    // Auto-sync if candidate has completed interview evaluation but result fields were not published
    const completedInterview = await Interview.findOne({
      candidate: candidate._id,
      status: 'completed',
    }).sort({ completedAt: -1 });

    if (completedInterview && (candidate.applicationStatus !== 'completed' || candidate.result === 'none' || !candidate.resultPublished)) {
      candidate.result = completedInterview.result;
      candidate.resultPublished = true;
      candidate.applicationStatus = 'completed';
      candidate.interviewStatus = 'completed';
      if (completedInterview.result === 'pass') candidate.assignmentStatus = 'passed';
      if (completedInterview.result === 'fail') candidate.assignmentStatus = 'failed';
      if (completedInterview.result === 'on_hold') candidate.assignmentStatus = 'on_hold';
      await candidate.save();
    }

    // Fetch assigned/completed interview if exists
    const activeInterview = await Interview.findOne({
      candidate: candidate._id,
    }).sort({ createdAt: -1 });

    const isVerified = Boolean(candidate.verifiedAt) || ['verified', 'assigned', 'ongoing', 'completed'].includes(candidate.applicationStatus);
    const isAssigned = Boolean(candidate.assignedEmployee) || ['assigned', 'ongoing', 'completed'].includes(candidate.applicationStatus);
    const isCompleted = candidate.applicationStatus === 'completed' || (completedInterview && completedInterview.status === 'completed');
    const isResultPublished = candidate.resultPublished && candidate.result !== 'none';

    // Build step-by-step timeline steps
    const timeline = [
      {
        key: 'registered',
        title: 'Application Submitted',
        description: 'Candidate profile registered in Kevalon system.',
        isCompleted: true,
        date: candidate.createdAt,
      },
      {
        key: 'verified',
        title: 'Candidate Verified',
        description: isVerified
          ? 'Checked in & verified at Reception Desk.'
          : 'Awaiting physical reception check-in.',
        isCompleted: isVerified,
        date: candidate.verifiedAt || null,
      },
      {
        key: 'assigned',
        title: 'Interview Assigned',
        description: isAssigned
          ? 'Skill-matched employee assigned for evaluation.'
          : isVerified
          ? 'Waiting in queue for matching employee availability.'
          : 'Pending reception verification.',
        isCompleted: isAssigned,
        date: activeInterview ? activeInterview.assignedAt : null,
      },
      {
        key: 'ongoing',
        title: 'Interview Completed',
        description: isCompleted
          ? 'Interview session finished & evaluated.'
          : isAssigned
          ? 'Interview session in progress.'
          : 'Awaiting interview assignment.',
        isCompleted: isCompleted,
        date: completedInterview ? completedInterview.completedAt : activeInterview && activeInterview.startedAt ? activeInterview.startedAt : null,
      },
      {
        key: 'result',
        title: 'Result Published',
        description: isResultPublished
          ? 'Interview evaluation result finalized.'
          : 'Result pending evaluation review.',
        isCompleted: isResultPublished,
        date: isResultPublished ? candidate.updatedAt : null,
      },
    ];

    res.json({
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        enrollmentNumber: candidate.enrollmentNumber,
        requiredRole: candidate.requiredRole,
        position: candidate.position,
        department: candidate.department,
        applicationStatus: candidate.applicationStatus,
        interviewStatus: candidate.interviewStatus,
        assignmentStatus: candidate.assignmentStatus,
        result: candidate.resultPublished ? candidate.result : 'none',
        resultPublished: candidate.resultPublished,
      },
      timeline,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate result page
// @route   GET /api/candidate/result
// @access  Private (Candidate)
const getCandidateResult = async (req, res, next) => {
  try {
    let candidate = await Candidate.findById(req.user._id).select(
      'enrollmentNumber name position department requiredRole applicationStatus interviewStatus assignmentStatus result resultPublished updatedAt'
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate record not found.' });
    }

    // Fetch interview if completed to get candidate-visible feedback
    const interview = await Interview.findOne({
      candidate: candidate._id,
      status: 'completed',
    }).sort({ completedAt: -1 });

    if (interview && (candidate.result === 'none' || !candidate.resultPublished)) {
      candidate.result = interview.result;
      candidate.resultPublished = true;
      candidate.applicationStatus = 'completed';
      candidate.interviewStatus = 'completed';
      await candidate.save();
    }

    const isPublished = candidate.resultPublished || Boolean(interview);
    const finalResult = isPublished && candidate.result !== 'none' ? candidate.result : interview ? interview.result : 'none';

    res.json({
      enrollmentNumber: candidate.enrollmentNumber,
      name: candidate.name,
      position: candidate.position,
      requiredRole: candidate.requiredRole,
      result: finalResult,
      resultPublished: isPublished,
      interviewDate: interview ? interview.completedAt : candidate.updatedAt,
      publishedDate: candidate.updatedAt,
      feedback: interview ? interview.feedback : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate notifications
// @route   GET /api/candidate/notifications
// @access  Private (Candidate)
const getCandidateNotifications = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.user._id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });

    const notifications = [];

    if (candidate.createdAt) {
      notifications.push({
        id: '1',
        title: 'Application Registered',
        message: `Welcome to Kevalon Technology! Your enrollment number is ${candidate.enrollmentNumber}.`,
        createdAt: candidate.createdAt,
        type: 'info',
      });
    }

    if (candidate.verifiedAt) {
      notifications.push({
        id: '2',
        title: 'Candidate Check-In Verified',
        message: 'Your check-in has been verified by the reception desk. You are now in the interview queue.',
        createdAt: candidate.verifiedAt,
        type: 'success',
      });
    }

    if (['assigned', 'ongoing'].includes(candidate.applicationStatus)) {
      notifications.push({
        id: '3',
        title: 'Interview Assigned',
        message: 'A skill-matched evaluator has been assigned to your interview.',
        createdAt: candidate.updatedAt,
        type: 'info',
      });
    }

    if (candidate.result !== 'none' && candidate.resultPublished) {
      notifications.push({
        id: '4',
        title: 'Interview Result Ready',
        message: 'Your interview evaluation result is now available in your Candidate Portal.',
        createdAt: candidate.updatedAt,
        type: candidate.result === 'pass' ? 'success' : candidate.result === 'fail' ? 'warning' : 'info',
      });
    }

    res.json(notifications.reverse());
  } catch (error) {
    next(error);
  }
};

module.exports = {
  candidateLogin,
  getCandidateProfile,
  getCandidateDashboard,
  getCandidateResult,
  getCandidateNotifications,
};
