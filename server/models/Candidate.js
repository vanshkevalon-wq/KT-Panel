const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    enrollmentNumber: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    requiredRole: {
      type: String,
      trim: true,
      default: 'uiux',
    },
    applicationStatus: {
      type: String,
      enum: ['registered', 'verified', 'waiting', 'assigned', 'ongoing', 'completed'],
      default: 'registered',
    },
    interviewStatus: {
      type: String,
      enum: ['waiting', 'assigned', 'ongoing', 'completed'],
      default: 'waiting',
    },
    result: {
      type: String,
      enum: ['none', 'pass', 'fail', 'on_hold'],
      default: 'none',
    },
    resultPublished: {
      type: Boolean,
      default: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignmentStatus: {
      type: String,
      enum: ['unverified', 'waiting', 'assigned', 'ongoing', 'completed', 'passed', 'failed', 'on_hold'],
      default: 'unverified',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    gender: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    education: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
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

candidateSchema.index({ mobileNumber: 1, phone: 1 });
candidateSchema.index({ status: 1, requiredRole: 1, assignmentStatus: 1 });
candidateSchema.index({ applicationStatus: 1, requiredRole: 1 });
candidateSchema.index({ assignedEmployee: 1, assignmentStatus: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
