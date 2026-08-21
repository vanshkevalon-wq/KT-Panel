const PracticalQuestion = require('../models/PracticalQuestion');
const { logActivity } = require('../services/auditLogService');

// @desc    Get all practical tasks with filters
// @route   GET /api/practical/questions
// @access  Private (Admin, Practical, HR, Theory)
const getPracticalQuestions = async (req, res, next) => {
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
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await PracticalQuestion.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual practical task
// @route   POST /api/practical/questions
// @access  Private (Admin, Practical)
const createPracticalQuestion = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructions,
      expectedOutput,
      technologies,
      category,
      difficulty,
      marks,
      timeLimit,
      status,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide task title and description' });
    }

    const task = await PracticalQuestion.create({
      title,
      description,
      instructions: instructions || '',
      expectedOutput: expectedOutput || '',
      technologies: Array.isArray(technologies) ? technologies : ['React', 'JavaScript'],
      category: category || 'Frontend',
      difficulty: difficulty || 'medium',
      marks: marks || 10,
      timeLimit: timeLimit || 60,
      source: 'manual',
      status: status || 'published',
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_PRACTICAL_TASK',
      module: 'PRACTICAL_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} created practical task "${title}"`,
      req,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update practical task
// @route   PUT /api/practical/questions/:id
// @access  Private (Admin, Practical)
const updatePracticalQuestion = async (req, res, next) => {
  try {
    const task = await PracticalQuestion.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Practical task not found' });
    }

    const {
      title,
      description,
      instructions,
      expectedOutput,
      technologies,
      category,
      difficulty,
      marks,
      timeLimit,
      status,
    } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (instructions !== undefined) task.instructions = instructions;
    if (expectedOutput !== undefined) task.expectedOutput = expectedOutput;
    if (Array.isArray(technologies)) task.technologies = technologies;
    if (category) task.category = category;
    if (difficulty) task.difficulty = difficulty;
    if (marks !== undefined) task.marks = marks;
    if (timeLimit !== undefined) task.timeLimit = timeLimit;
    if (status) task.status = status;

    await task.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE_PRACTICAL_TASK',
      module: 'PRACTICAL_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} updated practical task "${task.title}"`,
      req,
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete practical task
// @route   DELETE /api/practical/questions/:id
// @access  Private (Admin, Practical)
const deletePracticalQuestion = async (req, res, next) => {
  try {
    const task = await PracticalQuestion.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Practical task not found' });
    }

    await PracticalQuestion.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'DELETE_PRACTICAL_TASK',
      module: 'PRACTICAL_MANAGEMENT',
      description: `${req.user.role.toUpperCase()} deleted practical task #${req.params.id}`,
      req,
    });

    res.json({ message: 'Practical task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct practical categories
// @route   GET /api/practical/categories
// @access  Private
const getPracticalCategories = async (req, res, next) => {
  try {
    const categories = await PracticalQuestion.distinct('category');
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPracticalQuestions,
  createPracticalQuestion,
  updatePracticalQuestion,
  deletePracticalQuestion,
  getPracticalCategories,
};
