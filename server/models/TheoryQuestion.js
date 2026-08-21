const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. "A", "B", "C", "D"
  text: { type: String, required: true },
});

const theoryQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    correctAnswer: {
      type: String, // e.g. "A", "B", "C", "D"
      required: [true, 'Correct answer label is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'General',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    marks: {
      type: Number,
      default: 1,
    },
    explanation: {
      type: String,
      default: '',
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
    needsReview: {
      type: Boolean,
      default: false,
    },
    reviewNotes: {
      type: String,
      default: '',
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

module.exports = mongoose.model('TheoryQuestion', theoryQuestionSchema);
