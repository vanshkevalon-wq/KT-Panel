const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requiredRole: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'ongoing', 'completed'],
      default: 'assigned',
    },
    result: {
      type: String,
      enum: ['pass', 'fail', 'on_hold', null],
      default: null,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ candidate: 1, employee: 1 });
interviewSchema.index({ employee: 1, status: 1 });
interviewSchema.index({ status: 1, result: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
