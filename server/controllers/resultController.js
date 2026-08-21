const Result = require('../models/Result');
const AssessmentAssignment = require('../models/AssessmentAssignment');
const TheoryQuestion = require('../models/TheoryQuestion');
const PracticalQuestion = require('../models/PracticalQuestion');
const { logActivity } = require('../services/auditLogService');

// @desc    Get all results
// @route   GET /api/results
// @access  Private (Admin, HR, Theory, Practical)
const getResults = async (req, res, next) => {
  try {
    const results = await Result.find()
      .populate('candidateId')
      .populate('assessmentId')
      .populate('evaluatedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single result by ID
// @route   GET /api/results/:id
// @access  Private
const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('candidateId')
      .populate({
        path: 'assessmentId',
        populate: [{ path: 'theoryQuestions' }, { path: 'practicalTasks' }],
      })
      .populate('evaluatedBy', 'name email role');

    if (!result) {
      return res.status(404).json({ message: 'Result record not found' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assessment attempt (Auto-grades Theory, queues Practical)
// @route   POST /api/results/submit
// @access  Public / Candidate
const submitAssessment = async (req, res, next) => {
  try {
    const { assignmentId, theoryAnswers = [], practicalSubmissions = [] } = req.body;

    const assignment = await AssessmentAssignment.findById(assignmentId)
      .populate({
        path: 'assessmentId',
        populate: [{ path: 'theoryQuestions' }, { path: 'practicalTasks' }],
      })
      .populate('candidateId');

    if (!assignment) {
      return res.status(404).json({ message: 'Assessment assignment not found' });
    }

    const assessment = assignment.assessmentId;
    const candidate = assignment.candidateId;

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let theoryMarksObtained = 0;
    let totalTheoryMarks = 0;

    const processedTheoryAnswers = [];

    for (const tq of assessment.theoryQuestions) {
      totalTheoryMarks += tq.marks || 1;
      const candidateAns = theoryAnswers.find(
        (a) => String(a.questionId) === String(tq._id)
      );

      const selectedOption = candidateAns ? candidateAns.selectedOption : null;
      let isCorrect = false;
      let marksAwarded = 0;

      if (!selectedOption) {
        skippedCount++;
      } else if (selectedOption.toUpperCase() === (tq.correctAnswer || '').toUpperCase()) {
        isCorrect = true;
        correctCount++;
        marksAwarded = tq.marks || 1;
        theoryMarksObtained += marksAwarded;
      } else {
        incorrectCount++;
      }

      processedTheoryAnswers.push({
        questionId: tq._id,
        selectedOption,
        isCorrect,
        marksAwarded,
      });
    }

    let totalPracticalMarks = 0;
    const processedPracticalSubmissions = [];

    for (const pt of assessment.practicalTasks) {
      totalPracticalMarks += pt.marks || 10;
      const candidateSub = practicalSubmissions.find(
        (s) => String(s.taskId) === String(pt._id)
      );

      processedPracticalSubmissions.push({
        taskId: pt._id,
        submissionText: candidateSub ? candidateSub.submissionText || '' : '',
        submissionUrl: candidateSub ? candidateSub.submissionUrl || '' : '',
        candidateComments: candidateSub ? candidateSub.candidateComments || '' : '',
        scoreAwarded: 0,
        feedback: '',
        evaluated: false,
      });
    }

    const maxMarks = totalTheoryMarks + totalPracticalMarks;
    const initialTotalMarks = theoryMarksObtained;
    const initialPercentage = maxMarks > 0 ? Math.round((initialTotalMarks / maxMarks) * 100) : 0;
    const hasPracticalTasks = assessment.practicalTasks.length > 0;
    const status = hasPracticalTasks ? 'pending_review' : (initialPercentage >= (assessment.passingMarksPercentage || 60) ? 'passed' : 'failed');

    const result = await Result.create({
      assignmentId,
      candidateId: candidate._id,
      assessmentId: assessment._id,
      totalQuestions: assessment.theoryQuestions.length,
      correct: correctCount,
      incorrect: incorrectCount,
      skipped: skippedCount,
      theoryMarksObtained,
      totalTheoryMarks,
      practicalScore: 0,
      totalPracticalMarks,
      totalMarks: initialTotalMarks,
      maxMarks,
      percentage: initialPercentage,
      status,
      theoryAnswers: processedTheoryAnswers,
      practicalSubmissions: processedPracticalSubmissions,
    });

    assignment.status = 'completed';
    assignment.completedAt = new Date();
    await assignment.save();

    await logActivity({
      user: req.user || null,
      action: 'SUBMIT_ASSESSMENT',
      module: 'ASSESSMENT_RUNNER',
      description: `Candidate ${candidate.name} submitted assessment "${assessment.title}". Theory Score: ${theoryMarksObtained}/${totalTheoryMarks}.`,
      req,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate practical submission & finalize candidate result
// @route   PUT /api/results/:id/evaluate
// @access  Private (Admin, Practical, HR)
const gradePracticalResult = async (req, res, next) => {
  try {
    const { practicalScores = [], reviewerFeedback } = req.body;
    const result = await Result.findById(req.params.id).populate('assessmentId');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    let totalPracticalScoreAwarded = 0;

    for (const sub of result.practicalSubmissions) {
      const matchScore = practicalScores.find(
        (ps) => String(ps.taskId) === String(sub.taskId)
      );

      if (matchScore) {
        sub.scoreAwarded = Number(matchScore.scoreAwarded) || 0;
        sub.feedback = matchScore.feedback || '';
        sub.evaluated = true;
      }
      totalPracticalScoreAwarded += sub.scoreAwarded;
    }

    result.practicalScore = totalPracticalScoreAwarded;
    result.totalMarks = result.theoryMarksObtained + totalPracticalScoreAwarded;
    result.percentage = result.maxMarks > 0 ? Math.round((result.totalMarks / result.maxMarks) * 100) : 0;
    
    const passingPercentage = result.assessmentId?.passingMarksPercentage || 60;
    result.status = result.percentage >= passingPercentage ? 'passed' : 'failed';
    
    if (reviewerFeedback) {
      result.reviewerFeedback = reviewerFeedback;
    }
    result.evaluatedBy = req.user._id;

    await result.save();

    await logActivity({
      user: req.user,
      action: 'EVALUATE_PRACTICAL',
      module: 'ASSESSMENT_EVALUATION',
      description: `${req.user.role.toUpperCase()} user evaluated practical tasks for result #${result._id}. Final score: ${result.totalMarks}/${result.maxMarks} (${result.percentage}% - ${result.status.toUpperCase()}).`,
      req,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResults,
  getResultById,
  submitAssessment,
  gradePracticalResult,
};
