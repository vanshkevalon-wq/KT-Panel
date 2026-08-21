const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const { logActivity } = require('../services/auditLogService');
const { assignNextCandidateForEmployee, assignNextCandidateForRole } = require('../services/candidateAssignmentService');

// @desc    Get all employees (Admin Only)
// @route   GET /api/admin/employees
// @access  Private/Admin
const getEmployees = async (req, res, next) => {
  try {
    const { search, status, skill } = req.query;
    const query = { role: 'employee' };

    if (status && status !== 'all') {
      if (status === 'active') query.isActive = true;
      else if (status === 'inactive') query.isActive = false;
      else query.availabilityStatus = status;
    }

    if (skill && skill !== 'all') {
      query.employeeRoles = { $in: [skill, skill.toLowerCase()] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await User.find(query)
      .populate({
        path: 'currentCandidate',
        select: 'name email requiredRole assignmentStatus position',
      })
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Employee (Admin Only)
// @route   POST /api/admin/employees
// @access  Private/Admin
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, employeeRoles, isActive } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, Email, and Password are required.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: `User with email '${email}' already exists.` });
    }

    if (!Array.isArray(employeeRoles) || employeeRoles.length === 0) {
      return res.status(400).json({ message: 'At least one role/skill must be selected.' });
    }

    const employee = await User.create({
      name,
      email,
      password,
      role: 'employee',
      employeeRoles,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      availabilityStatus: 'available',
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_EMPLOYEE',
      module: 'EMPLOYEE_MANAGEMENT',
      description: `Admin created Employee ${employee.name} (${employee.email}) with skills: ${employee.employeeRoles.join(', ')}.`,
      req,
    });

    // Check if there are waiting candidates matching the new employee's skills
    try {
      await assignNextCandidateForEmployee(employee._id);
    } catch (e) {
      // ignore
    }

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      employeeRoles: employee.employeeRoles,
      availabilityStatus: employee.availabilityStatus,
      isActive: employee.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Employee (Admin Only)
// @route   PUT /api/admin/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res, next) => {
  try {
    const { name, email, password, employeeRoles, isActive, availabilityStatus } = req.body;
    const employee = await User.findById(req.params.id);

    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    if (name) employee.name = name;
    if (email) employee.email = email;
    if (password) employee.password = password;
    if (Array.isArray(employeeRoles)) employee.employeeRoles = employeeRoles;
    if (typeof isActive === 'boolean') employee.isActive = isActive;
    if (['available', 'busy', 'offline'].includes(availabilityStatus)) {
      employee.availabilityStatus = availabilityStatus;
    }

    await employee.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE_EMPLOYEE',
      module: 'EMPLOYEE_MANAGEMENT',
      description: `Admin updated employee profile for ${employee.email}.`,
      req,
    });

    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      employeeRoles: employee.employeeRoles,
      availabilityStatus: employee.availabilityStatus,
      isActive: employee.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate/Delete Employee (Admin Only)
// @route   DELETE /api/admin/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    employee.isActive = false;
    employee.availabilityStatus = 'offline';
    await employee.save();

    await logActivity({
      user: req.user,
      action: 'DEACTIVATE_EMPLOYEE',
      module: 'EMPLOYEE_MANAGEMENT',
      description: `Admin deactivated employee ${employee.email}.`,
      req,
    });

    res.json({ message: `Employee ${employee.name} deactivated successfully.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Dashboard statistics & current assignment
// @route   GET /api/employees/dashboard
// @access  Private (Employee)
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const employee = await User.findById(employeeId).populate({
      path: 'currentCandidate',
      select: 'name email phone requiredRole position assignmentStatus createdAt',
    });

    const interviews = await Interview.find({ employee: employeeId });

    const totalAssigned = await Candidate.countDocuments({ assignedEmployee: employeeId });
    const pendingInterviews = interviews.filter((i) => i.status === 'assigned').length;
    const ongoingInterviews = interviews.filter((i) => i.status === 'ongoing').length;
    const completedInterviews = interviews.filter((i) => i.status === 'completed').length;
    const passedCount = interviews.filter((i) => i.result === 'pass').length;
    const failedCount = interviews.filter((i) => i.result === 'fail').length;
    const onHoldCount = interviews.filter((i) => i.result === 'on_hold').length;

    res.json({
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeRoles: employee.employeeRoles,
        availabilityStatus: employee.availabilityStatus,
        currentCandidate: employee.currentCandidate,
      },
      stats: {
        totalAssigned,
        pendingInterviews,
        ongoingInterviews,
        completedInterviews,
        passedCount,
        failedCount,
        onHoldCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidates assigned to logged in Employee
// @route   GET /api/employees/my-candidates
// @access  Private (Employee)
const getMyCandidates = async (req, res, next) => {
  try {
    const employeeId = req.user._id;

    // Fetch all candidates assigned to this employee or in their interview history
    const candidates = await Candidate.find({ assignedEmployee: employeeId }).sort({
      updatedAt: -1,
    });

    // Attach active interview record if exists
    const candidatesWithInterviews = await Promise.all(
      candidates.map(async (cand) => {
        const activeInterview = await Interview.findOne({
          candidate: cand._id,
          employee: employeeId,
        }).sort({ createdAt: -1 });

        return {
          ...cand.toObject(),
          interviewId: activeInterview ? activeInterview._id : null,
          interviewStatus: activeInterview ? activeInterview.status : cand.assignmentStatus,
        };
      })
    );

    res.json(candidatesWithInterviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current ongoing/assigned interview for logged in Employee
// @route   GET /api/employees/current-interview
// @access  Private (Employee)
const getCurrentInterview = async (req, res, next) => {
  try {
    const employeeId = req.user._id;

    const interview = await Interview.findOne({
      employee: employeeId,
      status: { $in: ['assigned', 'ongoing'] },
    })
      .populate('candidate')
      .sort({ createdAt: -1 });

    res.json(interview || null);
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview history for logged in Employee
// @route   GET /api/employees/interview-history
// @access  Private (Employee)
const getInterviewHistory = async (req, res, next) => {
  try {
    const employeeId = req.user._id;

    const history = await Interview.find({
      employee: employeeId,
      status: 'completed',
    })
      .populate('candidate', 'name email position phone experience')
      .sort({ completedAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in Employee profile
// @route   GET /api/employees/profile
// @access  Private (Employee)
const getEmployeeProfile = async (req, res, next) => {
  try {
    const employee = await User.findById(req.user._id)
      .select('-password')
      .populate('currentCandidate', 'name email position requiredRole');

    const completedCount = await Interview.countDocuments({
      employee: req.user._id,
      status: 'completed',
    });

    res.json({
      employee,
      completedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Employee Availability Status
// @route   PUT /api/employees/availability
// @access  Private (Employee)
const updateAvailability = async (req, res, next) => {
  try {
    const { availabilityStatus } = req.body;
    const employee = await User.findById(req.user._id);

    if (!['available', 'busy', 'offline'].includes(availabilityStatus)) {
      return res.status(400).json({ message: 'Invalid availability status.' });
    }

    if (employee.currentCandidate && availabilityStatus === 'available') {
      return res
        .status(400)
        .json({ message: 'Cannot mark as Available while you have an active interview.' });
    }

    employee.availabilityStatus = availabilityStatus;
    await employee.save();

    // If employee turned available, attempt auto-assign waiting candidates
    if (availabilityStatus === 'available') {
      try {
        await assignNextCandidateForEmployee(employee._id);
      } catch (e) {
        // ignore
      }
    }

    res.json({
      availabilityStatus: employee.availabilityStatus,
      message: `Availability updated to ${employee.availabilityStatus}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeDashboard,
  getMyCandidates,
  getCurrentInterview,
  getInterviewHistory,
  getEmployeeProfile,
  updateAvailability,
};
