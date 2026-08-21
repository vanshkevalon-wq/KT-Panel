const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Skill = require('../models/Skill');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const {
  assignNextCandidateForRole,
  startInterview,
  completeInterview,
} = require('../services/candidateAssignmentService');

const runAcceptanceTest = async () => {
  console.log('=== STARTING REQUIREMENT #51 ACCEPTANCE TEST ===');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kt-panel';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for acceptance testing.');

    // Clean up test data
    await User.deleteMany({ email: { $in: ['rahul.test@kevalon.in', 'amit.test@kevalon.in'] } });
    await Candidate.deleteMany({ email: { $in: ['candA.test@example.com', 'candB.test@example.com', 'candC.test@example.com'] } });
    await Interview.deleteMany({ requiredRole: { $in: ['uiux', 'backend'] } });

    // 1. Admin creates Employee 1 (Rahul: UI/UX, Frontend)
    const employee1 = await User.create({
      name: 'Rahul',
      email: 'rahul.test@kevalon.in',
      password: 'Password@123',
      role: 'employee',
      employeeRoles: ['uiux', 'frontend'],
      availabilityStatus: 'available',
      isActive: true,
    });
    console.log('✔ Created Employee 1: Rahul (Skills: UI/UX, Frontend)');

    // 2. Admin creates Employee 2 (Amit: Backend)
    const employee2 = await User.create({
      name: 'Amit',
      email: 'amit.test@kevalon.in',
      password: 'Password@123',
      role: 'employee',
      employeeRoles: ['backend'],
      availabilityStatus: 'available',
      isActive: true,
    });
    console.log('✔ Created Employee 2: Amit (Skills: Backend)');

    // 3. Create Candidate A -> UI/UX
    const candA = await Candidate.create({
      name: 'Candidate A',
      email: 'candA.test@example.com',
      position: 'UI/UX Designer',
      requiredRole: 'uiux',
      department: 'Design',
      assignmentStatus: 'waiting',
    });
    await assignNextCandidateForRole('uiux');
    console.log('✔ Created Candidate A (UI/UX)');

    // 4. Create Candidate B -> Backend
    const candB = await Candidate.create({
      name: 'Candidate B',
      email: 'candB.test@example.com',
      position: 'Backend Developer',
      requiredRole: 'backend',
      department: 'Engineering',
      assignmentStatus: 'waiting',
    });
    await assignNextCandidateForRole('backend');
    console.log('✔ Created Candidate B (Backend)');

    // 5. Create Candidate C -> UI/UX
    const candC = await Candidate.create({
      name: 'Candidate C',
      email: 'candC.test@example.com',
      position: 'UI/UX Designer',
      requiredRole: 'uiux',
      department: 'Design',
      assignmentStatus: 'waiting',
    });
    await assignNextCandidateForRole('uiux');
    console.log('✔ Created Candidate C (UI/UX)');

    // Verify initial state
    const checkA = await Candidate.findById(candA._id);
    const checkB = await Candidate.findById(candB._id);
    const checkC = await Candidate.findById(candC._id);

    console.log('\n--- Initial Assignment State ---');
    console.log(`Candidate A -> Employee ID: ${checkA.assignedEmployee} (Expected: Rahul ${employee1._id})`);
    console.log(`Candidate B -> Employee ID: ${checkB.assignedEmployee} (Expected: Amit ${employee2._id})`);
    console.log(`Candidate C -> Status: ${checkC.assignmentStatus}, Employee: ${checkC.assignedEmployee} (Expected: Waiting, null)`);

    if (String(checkA.assignedEmployee) !== String(employee1._id)) {
      throw new Error('FAILED: Candidate A was not assigned to Rahul!');
    }
    if (String(checkB.assignedEmployee) !== String(employee2._id)) {
      throw new Error('FAILED: Candidate B was not assigned to Amit!');
    }
    if (checkC.assignedEmployee !== null || checkC.assignmentStatus !== 'waiting') {
      throw new Error('FAILED: Candidate C should be Waiting because Rahul is busy!');
    }

    // 6. Rahul completes Candidate A with PASS
    console.log('\n--- Step 2: Rahul completes Candidate A (Pass) ---');
    await completeInterview(candA._id, employee1._id, 'pass', 'Great UI/UX design portfolio.');

    const checkA_after = await Candidate.findById(candA._id);
    const checkRahul_afterA = await User.findById(employee1._id);
    const checkC_afterA = await Candidate.findById(candC._id);

    console.log(`Candidate A status: ${checkA_after.assignmentStatus} (Expected: passed)`);
    console.log(`Rahul current candidate: ${checkRahul_afterA.currentCandidate} (Expected: Candidate C ${candC._id})`);
    console.log(`Candidate C status: ${checkC_afterA.assignmentStatus}, Assigned To: ${checkC_afterA.assignedEmployee}`);

    if (checkA_after.assignmentStatus !== 'passed') {
      throw new Error('FAILED: Candidate A status should be passed!');
    }
    if (String(checkC_afterA.assignedEmployee) !== String(employee1._id)) {
      throw new Error('FAILED: Candidate C was not automatically assigned to Rahul after completing Candidate A!');
    }

    // 7. Amit completes Candidate B with FAIL
    console.log('\n--- Step 3: Amit completes Candidate B (Fail) ---');
    await completeInterview(candB._id, employee2._id, 'fail', 'Insufficient node.js knowledge.');

    const checkB_after = await Candidate.findById(candB._id);
    const checkAmit_afterB = await User.findById(employee2._id);

    console.log(`Candidate B status: ${checkB_after.assignmentStatus} (Expected: failed)`);
    console.log(`Amit availability status: ${checkAmit_afterB.availabilityStatus} (Expected: available)`);

    if (checkB_after.assignmentStatus !== 'failed') {
      throw new Error('FAILED: Candidate B status should be failed!');
    }
    if (checkAmit_afterB.availabilityStatus !== 'available') {
      throw new Error('FAILED: Amit should be available after finishing Candidate B!');
    }

    // 8. Rahul completes Candidate C with ON HOLD
    console.log('\n--- Step 4: Rahul completes Candidate C (On Hold) ---');
    await completeInterview(candC._id, employee1._id, 'on_hold', 'Requires second review.');

    const checkC_afterHold = await Candidate.findById(candC._id);
    const checkRahul_afterC = await User.findById(employee1._id);

    console.log(`Candidate C status: ${checkC_afterHold.assignmentStatus} (Expected: on_hold)`);
    console.log(`Rahul availability status: ${checkRahul_afterC.availabilityStatus} (Expected: available)`);
    console.log(`Candidate C assigned employee: ${checkC_afterHold.assignedEmployee} (Expected: null)`);

    if (checkC_afterHold.assignmentStatus !== 'on_hold') {
      throw new Error('FAILED: Candidate C status should be on_hold!');
    }
    if (checkC_afterHold.assignedEmployee !== null) {
      throw new Error('FAILED: On Hold candidate must NOT automatically return to Rahul!');
    }

    console.log('\n=================================================');
    console.log('🎉 REQUIREMENT #51 ACCEPTANCE TEST PASSED 100%! 🎉');
    console.log('=================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Acceptance Test Failed:', err);
    process.exit(1);
  }
};

runAcceptanceTest();
