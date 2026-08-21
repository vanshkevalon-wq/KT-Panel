const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Skill = require('../models/Skill');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const CheckIn = require('../models/CheckIn');
const {
  assignNextCandidateForRole,
  startInterview,
  completeInterview,
} = require('../services/candidateAssignmentService');

const runCandidateReceptionTest = async () => {
  console.log('=== STARTING REQUIREMENT #56 END-TO-END ACCEPTANCE TEST ===');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kt-panel';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for acceptance testing.');

    // Clean up test data
    await User.deleteMany({ email: { $in: ['rahul.test@kevalon.in', 'amit.test@kevalon.in', 'priya.reception@kevalon.in'] } });
    await Candidate.deleteMany({ email: { $in: ['john.patel@example.com', 'test.cand2@example.com'] } });
    await Interview.deleteMany({});
    await CheckIn.deleteMany({});

    // Step 1 — Admin creates employees
    const rahul = await User.create({
      name: 'Rahul',
      email: 'rahul.test@kevalon.in',
      password: 'Password@123',
      role: 'employee',
      employeeRoles: ['uiux', 'frontend'],
      availabilityStatus: 'available',
      isActive: true,
    });
    console.log('✔ Step 1: Admin created Employee 1: Rahul (Skills: UI/UX, Frontend)');

    const amit = await User.create({
      name: 'Amit',
      email: 'amit.test@kevalon.in',
      password: 'Password@123',
      role: 'employee',
      employeeRoles: ['backend'],
      availabilityStatus: 'available',
      isActive: true,
    });
    console.log('✔ Step 1: Admin created Employee 2: Amit (Skills: Backend)');

    const receptionist = await User.create({
      name: 'Priya Reception',
      email: 'priya.reception@kevalon.in',
      password: 'Password@123',
      role: 'receptionist',
      isActive: true,
    });
    console.log('✔ Admin created Receptionist user: Priya');

    // Step 2 — Admin creates candidate (John Patel)
    const john = await Candidate.create({
      enrollmentNumber: 'KT202600001',
      name: 'John Patel',
      email: 'john.patel@example.com',
      phone: '9876543210',
      mobileNumber: '9876543210',
      position: 'UI/UX Designer',
      requiredRole: 'uiux',
      department: 'Design',
      applicationStatus: 'registered',
      assignmentStatus: 'unverified',
      status: 'active',
    });
    console.log('✔ Step 2: Admin created Candidate: John Patel (Enrollment: KT202600001, Mobile: 9876543210, Role: UI/UX)');

    // Step 3 — Candidate Login Simulation (KT202600001 + 9876543210)
    const loginCandidate = await Candidate.findOne({
      enrollmentNumber: 'KT202600001',
      status: 'active',
    });

    if (!loginCandidate || loginCandidate.mobileNumber !== '9876543210') {
      throw new Error('FAILED: Candidate login credentials check failed!');
    }
    console.log('✔ Step 3: Candidate Login successful with Enrollment KT202600001 + Mobile 9876543210');
    console.log(`Initial Application Status: ${loginCandidate.applicationStatus} (Expected: registered)`);

    // Step 4 — Candidate Arrives -> Receptionist searches KT202600001
    const searchedCandidate = await Candidate.findOne({ enrollmentNumber: 'KT202600001' });
    if (!searchedCandidate) {
      throw new Error('FAILED: Receptionist candidate search failed!');
    }
    console.log(`✔ Step 4: Receptionist found candidate ${searchedCandidate.name}`);

    // Receptionist clicks "Candidate Is Here"
    searchedCandidate.applicationStatus = 'verified';
    searchedCandidate.assignmentStatus = 'waiting';
    searchedCandidate.verifiedAt = new Date();
    searchedCandidate.verifiedBy = receptionist._id;
    await searchedCandidate.save();

    await CheckIn.create({
      candidate: searchedCandidate._id,
      receptionist: receptionist._id,
      verifiedAt: searchedCandidate.verifiedAt,
    });
    console.log('✔ Step 5: Receptionist clicked "Candidate Is Here". Application Status: verified');

    // Step 6 — Automatic Employee Assignment Engine
    const assignResult = await assignNextCandidateForRole('uiux');
    console.log('✔ Step 6: Automatic Employee Assignment Engine invoked for role UI/UX');

    const john_after = await Candidate.findById(john._id);
    const rahul_after = await User.findById(rahul._id);

    console.log(`Candidate Assigned Employee ID: ${john_after.assignedEmployee} (Expected: Rahul ${rahul._id})`);
    console.log(`Rahul Availability Status: ${rahul_after.availabilityStatus} (Expected: busy)`);

    if (String(john_after.assignedEmployee) !== String(rahul._id)) {
      throw new Error('FAILED: Candidate was not assigned to Rahul!');
    }
    if (rahul_after.availabilityStatus !== 'busy') {
      throw new Error('FAILED: Rahul availability status should be busy!');
    }

    // Step 7 & 8 — Rahul starts & completes interview with PASS
    console.log('\n--- Steps 7, 8, 9: Rahul starts interview and completes with PASS ---');
    const activeInterview = await Interview.findOne({ candidate: john._id, employee: rahul._id });
    await startInterview(activeInterview._id, rahul._id);
    await completeInterview(john._id, rahul._id, 'pass', 'Met all UI/UX design portfolio criteria.');

    const john_final = await Candidate.findById(john._id);
    const rahul_final = await User.findById(rahul._id);

    console.log(`Candidate Final Assignment Status: ${john_final.assignmentStatus} (Expected: passed)`);
    console.log(`Rahul Final Availability Status: ${rahul_final.availabilityStatus} (Expected: available)`);

    if (john_final.assignmentStatus !== 'passed') {
      throw new Error('FAILED: Candidate status should be passed!');
    }
    if (rahul_final.availabilityStatus !== 'available') {
      throw new Error('FAILED: Rahul should be available after completing interview!');
    }

    console.log('\n=================================================');
    console.log('🎉 REQUIREMENT #56 END-TO-END TEST PASSED 100%! 🎉');
    console.log('=================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Acceptance Test Failed:', err);
    process.exit(1);
  }
};

runCandidateReceptionTest();
