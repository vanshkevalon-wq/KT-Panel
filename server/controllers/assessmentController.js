const Assessment = require('../models/Assessment');
const AssessmentAssignment = require('../models/AssessmentAssignment');
const Candidate = require('../models/Candidate');
const { logActivity } = require('../services/auditLogService');

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private
const getAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find()
      .populate('theoryQuestions')
      .populate('practicalTasks')
      .sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private (Admin, Theory, Practical, HR)
const createAssessment = async (req, res, next) => {
  try {
    const {
      title,
      description,
      theoryQuestions,
      practicalTasks,
      totalDuration,
      passingMarksPercentage,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Assessment title is required' });
    }

    const assessment = await Assessment.create({
      title,
      description: description || '',
      theoryQuestions: theoryQuestions || [],
      practicalTasks: practicalTasks || [],
      totalDuration: totalDuration || 60,
      passingMarksPercentage: passingMarksPercentage || 60,
      status: status || 'published',
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_ASSESSMENT',
      module: 'ASSESSMENT_MANAGEMENT',
      description: `Created assessment "${assessment.title}" (${assessment.theoryQuestions.length} theory, ${assessment.practicalTasks.length} practical tasks).`,
      req,
    });

    res.status(201).json(assessment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private (Admin, Theory, Practical, HR)
const updateAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const {
      title,
      description,
      theoryQuestions,
      practicalTasks,
      totalDuration,
      passingMarksPercentage,
      status,
    } = req.body;

    if (title) assessment.title = title;
    if (description !== undefined) assessment.description = description;
    if (Array.isArray(theoryQuestions)) assessment.theoryQuestions = theoryQuestions;
    if (Array.isArray(practicalTasks)) assessment.practicalTasks = practicalTasks;
    if (totalDuration) assessment.totalDuration = totalDuration;
    if (passingMarksPercentage) assessment.passingMarksPercentage = passingMarksPercentage;
    if (status) assessment.status = status;

    await assessment.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE_ASSESSMENT',
      module: 'ASSESSMENT_MANAGEMENT',
      description: `Updated assessment "${assessment.title}"`,
      req,
    });

    res.json(assessment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Admin)
const deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    await Assessment.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'DELETE_ASSESSMENT',
      module: 'ASSESSMENT_MANAGEMENT',
      description: `Deleted assessment #${req.params.id}`,
      req,
    });

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign assessment to candidate
// @route   POST /api/assessments/:id/assign
// @access  Private (Admin, HR)
const assignAssessment = async (req, res, next) => {
  try {
    const { candidateId, dueDate, duration } = req.body;
    const assessmentId = req.params.id;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const assignment = await AssessmentAssignment.create({
      candidateId,
      assessmentId,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 days
      duration: duration || assessment.totalDuration || 60,
      status: 'assigned',
      assignedBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'ASSIGN_ASSESSMENT',
      module: 'ASSESSMENT_ASSIGNMENT',
      description: `${req.user.role.toUpperCase()} assigned assessment "${assessment.title}" to candidate ${candidate.name}.`,
      req,
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidate assignments
// @route   GET /api/assessments/assignments/all
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const assignments = await AssessmentAssignment.find()
      .populate('candidateId')
      .populate({
        path: 'assessmentId',
        populate: [{ path: 'theoryQuestions' }, { path: 'practicalTasks' }],
      })
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  assignAssessment,
  getAssignments,
};
