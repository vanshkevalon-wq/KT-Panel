const ContactInquiry = require('../models/ContactInquiry');
const JobApplication = require('../models/JobApplication');
const { logActivity } = require('../services/auditLogService');

// @desc    Submit Public Contact HR Message
// @route   POST /api/public/contact
// @access  Public
const submitContactInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const inquiry = await ContactInquiry.create({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent to Kevalon HR team.',
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Public Job Application
// @route   POST /api/public/apply
// @access  Public
const submitJobApplication = async (req, res, next) => {
  try {
    const { name, email, phone, position, department, experience, notes } = req.body;

    if (!name || !email || !phone || !position) {
      return res.status(400).json({ message: 'Name, email, phone, and position are required.' });
    }

    const application = await JobApplication.create({
      name,
      email,
      phone,
      position,
      department: department || 'Engineering',
      experience: experience || '',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: `Application submitted successfully for ${position}! HR team will review your application soon.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Contact Inquiries for Admin
// @route   GET /api/admin/inquiries
// @access  Private (Admin, HR)
const getContactInquiries = async (req, res, next) => {
  try {
    const inquiries = await ContactInquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Contact Inquiry as Read / Update Status
// @route   PUT /api/admin/inquiries/:id
// @access  Private (Admin, HR)
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, isRead } = req.body;
    const inquiry = await ContactInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Contact inquiry not found.' });
    }

    if (status) inquiry.status = status;
    if (typeof isRead === 'boolean') inquiry.isRead = isRead;
    if (status === 'read' || status === 'responded') inquiry.isRead = true;

    await inquiry.save();
    res.json(inquiry);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Contact Inquiry
// @route   DELETE /api/admin/inquiries/:id
// @access  Private (Admin)
const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await ContactInquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }
    res.json({ message: 'Inquiry deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Job Applications for Admin
// @route   GET /api/admin/job-applications
// @access  Private (Admin, HR)
const getJobApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Job Application Status
// @route   PUT /api/admin/job-applications/:id/status
// @access  Private (Admin, HR)
const updateJobApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Job application not found.' });
    }

    if (status) application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Job Application
// @route   DELETE /api/admin/job-applications/:id
// @access  Private (Admin)
const deleteJobApplication = async (req, res, next) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Job application not found.' });
    }
    res.json({ message: 'Job application deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactInquiry,
  submitJobApplication,
  getContactInquiries,
  updateInquiryStatus,
  deleteInquiry,
  getJobApplications,
  updateJobApplicationStatus,
  deleteJobApplication,
};
