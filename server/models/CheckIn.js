const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    receptionist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['verified', 'cancelled'],
      default: 'verified',
    },
  },
  {
    timestamps: true,
  }
);

checkInSchema.index({ candidate: 1, verifiedAt: -1 });

module.exports = mongoose.model('CheckIn', checkInSchema);
