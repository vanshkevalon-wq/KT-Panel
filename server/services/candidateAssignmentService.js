const mongoose = require('mongoose');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const { logActivity } = require('./auditLogService');

/**
 * Normalizes role string for consistent matching
 */
const normalizeRole = (role) => {
  if (!role) return '';
  return String(role).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

const isRoleMatch = (role1, role2) => {
  const r1 = normalizeRole(role1);
  const r2 = normalizeRole(role2);
  if (!r1 || !r2) return false;
  return r1 === r2 || r1.includes(r2) || r2.includes(r1);
};

/**
 * Finds best matching available employee for a candidate's required role.
 */
const findBestAvailableEmployee = async (requiredRole) => {
  const normRole = normalizeRole(requiredRole);
  if (!normRole) return null;

  // Find all active employee users
  const activeEmployees = await User.find({
    role: 'employee',
    isActive: true,
    availabilityStatus: 'available',
  });

  // Filter employees who possess matching role/skill
  const matchingEmployees = activeEmployees.filter((emp) => {
    return (emp.employeeRoles || []).some((role) => isRoleMatch(role, requiredRole));
  });

  if (matchingEmployees.length === 0) {
    return null;
  }

  // Filter out any employee who already has an assigned or ongoing interview
  const strictlyAvailableEmployees = [];
  for (const emp of matchingEmployees) {
    const activeCount = await Interview.countDocuments({
      employee: emp._id,
      status: { $in: ['assigned', 'ongoing'] },
    });
    if (activeCount === 0) {
      strictlyAvailableEmployees.push(emp);
    } else {
      if (emp.availabilityStatus !== 'busy') {
        emp.availabilityStatus = 'busy';
        await emp.save();
      }
    }
  }

  if (strictlyAvailableEmployees.length === 0) {
    return null;
  }

  strictlyAvailableEmployees.sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
  );

  return strictlyAvailableEmployees[0];
};

/**
 * Assigns next waiting candidate matching an employee's skills.
 */
const assignNextCandidateForEmployee = async (employeeId) => {
  const employee = await User.findById(employeeId);
  if (!employee || !employee.isActive || employee.role !== 'employee') {
    return null;
  }

  if (employee.availabilityStatus !== 'available') {
    return null;
  }

  const activeCount = await Interview.countDocuments({
    employee: employeeId,
    status: { $in: ['assigned', 'ongoing'] },
  });

  if (activeCount > 0) {
    if (employee.availabilityStatus !== 'busy') {
      employee.availabilityStatus = 'busy';
      await employee.save();
    }
    return null;
  }

  const empRoles = employee.employeeRoles || [];
  if (empRoles.length === 0) {
    return null;
  }

  // Find oldest waiting verified candidates
  const waitingCandidates = await Candidate.find({
    status: 'active',
    assignmentStatus: 'waiting',
    assignedEmployee: null,
    applicationStatus: { $in: ['verified', 'waiting'] },
  }).sort({ createdAt: 1 });

  // Find first candidate whose requiredRole matches employee's skills
  const candidateToAssign = waitingCandidates.find((cand) => {
    return empRoles.some((eRole) => isRoleMatch(eRole, cand.requiredRole));
  });

  if (!candidateToAssign) {
    return null;
  }

  return await assignCandidateToEmployee(candidateToAssign._id, employee._id);
};

/**
 * Assigns next available candidate matching requiredRole to an available employee.
 */
const assignNextCandidateForRole = async (requiredRole, candidateId = null) => {
  const normRole = normalizeRole(requiredRole);

  let candidateToAssign = null;

  if (candidateId) {
    candidateToAssign = await Candidate.findOne({
      _id: candidateId,
      status: 'active',
      assignmentStatus: 'waiting',
      applicationStatus: { $in: ['verified', 'waiting'] },
    });
  }

  if (!candidateToAssign && normRole) {
    const waitingCandidates = await Candidate.find({
      status: 'active',
      assignmentStatus: 'waiting',
      assignedEmployee: null,
      applicationStatus: { $in: ['verified', 'waiting'] },
    }).sort({ createdAt: 1 });

    candidateToAssign = waitingCandidates.find((cand) =>
      isRoleMatch(cand.requiredRole, requiredRole)
    );
  }

  if (!candidateToAssign) {
    return null;
  }

  const bestEmployee = await findBestAvailableEmployee(candidateToAssign.requiredRole);
  if (!bestEmployee) {
    return null; // No available employee for this field -> Admin will manually assign!
  }

  return await assignCandidateToEmployee(candidateToAssign._id, bestEmployee._id);
};

/**
 * Atomic candidate assignment worker
 */
const assignCandidateToEmployee = async (candidateId, employeeId) => {
  // Use atomic findOneAndUpdate for candidate to prevent double-assignment race condition
  const candidate = await Candidate.findOneAndUpdate(
    {
      _id: candidateId,
      assignmentStatus: 'waiting',
    },
    {
      $set: {
        assignedEmployee: employeeId,
        assignmentStatus: 'assigned',
        applicationStatus: 'assigned',
      },
    },
    { returnDocument: 'after' }
  );

  if (!candidate) {
    return null; // Candidate was already assigned by concurrent thread
  }

  // Update employee state
  const employee = await User.findByIdAndUpdate(
    employeeId,
    {
      $set: {
        currentCandidate: candidate._id,
        availabilityStatus: 'busy',
      },
    },
    { returnDocument: 'after' }
  );

  // Check if an existing assigned/ongoing interview record exists or create new
  let interview = await Interview.findOne({
    candidate: candidate._id,
    employee: employeeId,
    status: { $in: ['assigned', 'ongoing'] },
  });

  if (!interview) {
    interview = await Interview.create({
      candidate: candidate._id,
      employee: employeeId,
      requiredRole: candidate.requiredRole,
      status: 'assigned',
      assignedAt: new Date(),
    });
  }

  return { candidate, employee, interview };
};

/**
 * Employee starts an assigned interview
 */
const startInterview = async (interviewId, employeeId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new Error('Interview record not found.');
  }

  if (interview.employee.toString() !== employeeId.toString()) {
    throw new Error('Unauthorized: You are not assigned to this interview.');
  }

  interview.status = 'ongoing';
  interview.startedAt = interview.startedAt || new Date();
  await interview.save();

  await Candidate.findByIdAndUpdate(interview.candidate, {
    assignmentStatus: 'ongoing',
  });

  await User.findByIdAndUpdate(employeeId, {
    availabilityStatus: 'busy',
    currentCandidate: interview.candidate,
  });

  return interview;
};

/**
 * Complete interview flow (Pass / Fail / On Hold)
 */
const completeInterview = async (candidateId, employeeId, result, feedback = '') => {
  if (!['pass', 'fail', 'on_hold'].includes(result)) {
    throw new Error('Invalid interview result. Must be Pass, Fail, or On Hold.');
  }

  const interview = await Interview.findOne({
    candidate: candidateId,
    employee: employeeId,
    status: { $in: ['assigned', 'ongoing'] },
  });

  if (!interview) {
    throw new Error('No active interview found for this candidate and employee.');
  }

  // Map result to candidate assignmentStatus
  const statusMap = {
    pass: 'passed',
    fail: 'failed',
    on_hold: 'on_hold',
  };
  const finalCandidateStatus = statusMap[result];

  // Update interview record
  interview.status = 'completed';
  interview.result = result;
  interview.completedAt = new Date();
  interview.feedback = feedback;
  interview.feedbackVisibleToCandidate = true;
  await interview.save();

  // Update candidate record
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    {
      result: result,
      resultPublished: true,
      applicationStatus: 'completed',
      interviewStatus: 'completed',
      assignmentStatus: finalCandidateStatus,
      // If on hold, clear assigned employee so it stays in queue without locking employee
      ...(result === 'on_hold' ? { assignedEmployee: null } : {}),
    },
    { returnDocument: 'after' }
  );

  // Release employee to Available
  const employee = await User.findByIdAndUpdate(
    employeeId,
    {
      availabilityStatus: 'available',
      currentCandidate: null,
    },
    { returnDocument: 'after' }
  );

  // Automatically trigger search for NEXT waiting candidate matching employee's skills!
  let nextAssignment = null;
  try {
    nextAssignment = await assignNextCandidateForEmployee(employeeId);
  } catch (err) {
    console.error('Auto next assignment error:', err.message);
  }

  return { candidate, employee, interview, nextAssignment };
};

/**
 * Manual override assignment by Admin
 */
const manualAssignCandidate = async (candidateId, employeeId, reqUser) => {
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) throw new Error('Candidate not found.');

  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee' || !employee.isActive) {
    throw new Error('Selected user is not an active employee.');
  }

  // Update candidate
  candidate.assignedEmployee = employee._id;
  candidate.assignmentStatus = 'assigned';
  await candidate.save();

  // Update employee
  employee.currentCandidate = candidate._id;
  employee.availabilityStatus = 'busy';
  await employee.save();

  // Create or update interview record
  const interview = await Interview.create({
    candidate: candidate._id,
    employee: employee._id,
    requiredRole: candidate.requiredRole,
    status: 'assigned',
    assignedAt: new Date(),
  });

  return { candidate, employee, interview };
};

module.exports = {
  findBestAvailableEmployee,
  assignNextCandidateForEmployee,
  assignNextCandidateForRole,
  assignCandidateToEmployee,
  startInterview,
  completeInterview,
  manualAssignCandidate,
};
