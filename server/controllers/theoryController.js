const TheoryQuestion = require('../models/TheoryQuestion');
const { logActivity } = require('../services/auditLogService');

// @desc    Get all theory questions with filters
// @route   GET /api/theory/questions
// @access  Private (Admin, Theory, HR, Practical)
const getTheoryQuestions = async (req, res, next) => {
  try {
    const { search, category, difficulty, source, status } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (source && source !== 'all') {
      query.source = source;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const questions = await TheoryQuestion.find(query).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual theory question
// @route   POST /api/theory/questions
// @access  Private (Admin, Theory)
const createTheoryQuestion = async (req, res, next) => {
  try {
    const {
      questionText,
      options,
      correctAnswer,
      category,
      difficulty,
      marks,
      explanation,
      status,
    } = req.body;

    if (!questionText || !options || options.length < 2 || !correctAnswer) {
      return res.status(400).json({ message: 'Please provide question text, at least 2 options, and a correct answer.' });
    }

    const question = await TheoryQuestion.create({
      questionText,
      options,
      correctAnswer,
      category: category || 'General',
      difficulty: difficulty || 'medium',
      marks: marks || 1,
      explanation: explanation || '',
      source: 'manual',
      status: status || 'published',
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_THEORY_QUESTION',
      module: 'THEORY_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} created theory question "${questionText.substring(0, 30)}..."`,
      req,
    });

    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Update theory question
// @route   PUT /api/theory/questions/:id
// @access  Private (Admin, Theory)
const updateTheoryQuestion = async (req, res, next) => {
  try {
    const question = await TheoryQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Theory question not found' });
    }

    const {
      questionText,
      options,
      correctAnswer,
      category,
      difficulty,
      marks,
      explanation,
      status,
      needsReview,
      reviewNotes,
    } = req.body;

    if (questionText) question.questionText = questionText;
    if (options) question.options = options;
    if (correctAnswer) question.correctAnswer = correctAnswer;
    if (category) question.category = category;
    if (difficulty) question.difficulty = difficulty;
    if (marks !== undefined) question.marks = marks;
    if (explanation !== undefined) question.explanation = explanation;
    if (status) question.status = status;
    if (typeof needsReview === 'boolean') question.needsReview = needsReview;
    if (reviewNotes !== undefined) question.reviewNotes = reviewNotes;

    await question.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE_THEORY_QUESTION',
      module: 'THEORY_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} updated theory question #${question._id}`,
      req,
    });

    res.json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theory question
// @route   DELETE /api/theory/questions/:id
// @access  Private (Admin, Theory)
const deleteTheoryQuestion = async (req, res, next) => {
  try {
    const question = await TheoryQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Theory question not found' });
    }

    await TheoryQuestion.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'DELETE_THEORY_QUESTION',
      module: 'THEORY_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} deleted theory question #${req.params.id}`,
      req,
    });

    res.json({ message: 'Theory question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct theory categories
// @route   GET /api/theory/categories
// @access  Private
const getTheoryCategories = async (req, res, next) => {
  try {
    const categories = await TheoryQuestion.distinct('category');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheoryQuestions,
  createTheoryQuestion,
  updateTheoryQuestion,
  deleteTheoryQuestion,
  getTheoryCategories,
};
