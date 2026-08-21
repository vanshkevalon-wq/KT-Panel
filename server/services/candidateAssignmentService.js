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

/**
 * Finds best matching available employee for a candidate's required role.
 * Queue / Load balancing logic:
 * 1. Filter active employees having the required role in employeeRoles.
 * 2. Filter out offline / busy employees.
 * 3. Workload check: lowest active assignments count.
 * 4. Pick longest available / longest created.
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

  // Filter employees who possess the required role (case-insensitive slug match)
  const matchingEmployees = activeEmployees.filter((emp) => {
    const userRoles = (emp.employeeRoles || []).map(normalizeRole);
    return userRoles.includes(normRole);
  });

  if (matchingEmployees.length === 0) {
    return null;
  }

  // Calculate active workload (ongoing/assigned interviews) for each matching employee
  const employeeWorkloads = await Promise.all(
    matchingEmployees.map(async (emp) => {
      const activeCount = await Interview.countDocuments({
        employee: emp._id,
        status: { $in: ['assigned', 'ongoing'] },
      });
      return { employee: emp, activeCount };
    })
  );

  // Sort by lowest active count, then by oldest updatedAt
  employeeWorkloads.sort((a, b) => {
    if (a.activeCount !== b.activeCount) {
      return a.activeCount - b.activeCount;
    }
    return new Date(a.employee.updatedAt) - new Date(b.employee.updatedAt);
  });

  return employeeWorkloads[0].employee;
};

/**
 * Assigns next waiting candidate matching an employee's skills.
 * Triggered when an employee becomes AVAILABLE.
 */
const assignNextCandidateForEmployee = async (employeeId) => {
  const employee = await User.findById(employeeId);
  if (!employee || !employee.isActive || employee.role !== 'employee') {
    return null;
  }

  // Employee must be available
  if (employee.availabilityStatus !== 'available') {
    return null;
  }

  const normalizedEmployeeRoles = (employee.employeeRoles || []).map(normalizeRole);
  if (normalizedEmployeeRoles.length === 0) {
    return null;
  }

  // Find oldest waiting candidates
  const waitingCandidates = await Candidate.find({
    status: 'active',
    assignmentStatus: 'waiting',
    assignedEmployee: null,
  }).sort({ createdAt: 1 });

  // Find first candidate whose requiredRole matches one of employee's roles
  const candidateToAssign = waitingCandidates.find((cand) => {
    return normalizedEmployeeRoles.includes(normalizeRole(cand.requiredRole));
  });

  if (!candidateToAssign) {
    return null; // No waiting candidates matching employee's skills
  }

  // Perform atomic assignment
  return await assignCandidateToEmployee(candidateToAssign._id, employee._id);
};

/**
 * Assigns next available candidate matching requiredRole to an available employee.
 * Triggered when a new CANDIDATE is created or added to queue.
 */
const assignNextCandidateForRole = async (requiredRole) => {
  const normRole = normalizeRole(requiredRole);
  if (!normRole) return null;

  // Find oldest waiting candidate for this role
  const waitingCandidates = await Candidate.find({
    status: 'active',
    assignmentStatus: 'waiting',
    assignedEmployee: null,
  }).sort({ createdAt: 1 });

  const candidateToAssign = waitingCandidates.find(
    (cand) => normalizeRole(cand.requiredRole) === normRole
  );

  if (!candidateToAssign) {
    return null;
  }

  const bestEmployee = await findBestAvailableEmployee(candidateToAssign.requiredRole);
  if (!bestEmployee) {
    return null; // All employees busy or no employee has this role
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
      },
    },
    { new: true }
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
    { new: true }
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
  await interview.save();

  // Update candidate record
  const candidate = await Candidate.findByIdAndUpdate(
    candidateId,
    {
      assignmentStatus: finalCandidateStatus,
      // If on hold, clear assigned employee so it stays in queue without locking employee
      ...(result === 'on_hold' ? { assignedEmployee: null } : {}),
    },
    { new: true }
  );

  // Release employee to Available
  const employee = await User.findByIdAndUpdate(
    employeeId,
    {
      availabilityStatus: 'available',
      currentCandidate: null,
    },
    { new: true }
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
