const mongoose = require('mongoose');

const theoryAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TheoryQuestion' },
  selectedOption: { type: String, default: null }, // e.g. "A", "B", null
  isCorrect: { type: Boolean, default: false },
  marksAwarded: { type: Number, default: 0 },
});

const practicalSubmissionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticalQuestion' },
  submissionText: { type: String, default: '' },
  submissionUrl: { type: String, default: '' },
  candidateComments: { type: String, default: '' },
  scoreAwarded: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  evaluated: { type: Boolean, default: false },
});

const resultSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssessmentAssignment',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    totalQuestions: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    theoryMarksObtained: { type: Number, default: 0 },
    totalTheoryMarks: { type: Number, default: 0 },
    practicalScore: { type: Number, default: 0 },
    totalPracticalMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['passed', 'failed', 'pending_review'],
      default: 'pending_review',
    },
    reviewerFeedback: { type: String, default: '' },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    theoryAnswers: [theoryAnswerSchema],
    practicalSubmissions: [practicalSubmissionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Result', resultSchema);
