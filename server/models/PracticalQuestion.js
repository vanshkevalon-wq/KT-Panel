const mongoose = require('mongoose');

const practicalQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
    },
    instructions: {
      type: String,
      default: '',
    },
    expectedOutput: {
      type: String,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'Frontend',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    marks: {
      type: Number,
      default: 10,
    },
    timeLimit: {
      type: Number, // in minutes
      default: 60,
    },
    source: {
      type: String,
      enum: ['manual', 'pdf'],
      default: 'manual',
    },
    sourceFileName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PracticalQuestion', practicalQuestionSchema);
