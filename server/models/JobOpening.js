const mongoose = require('mongoose');

const jobOpeningSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Full Stack',
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering',
    },
    experience: {
      type: String,
      trim: true,
      default: '1 - 3 Years',
    },
    location: {
      type: String,
      trim: true,
      default: 'Solaris Hub, Ahmedabad',
    },
    type: {
      type: String,
      trim: true,
      default: 'Full-Time',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active',
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobOpening', jobOpeningSchema);
