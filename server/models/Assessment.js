const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    theoryQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TheoryQuestion',
      },
    ],
    practicalTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PracticalQuestion',
      },
    ],
    totalDuration: {
      type: Number, // in minutes
      required: true,
      default: 60,
    },
    passingMarksPercentage: {
      type: Number,
      default: 60,
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

module.exports = mongoose.model('Assessment', assessmentSchema);
