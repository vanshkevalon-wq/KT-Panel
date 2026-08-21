const User = require('../models/User');
const TheoryQuestion = require('../models/TheoryQuestion');
const PracticalQuestion = require('../models/PracticalQuestion');
const Candidate = require('../models/Candidate');
const Assessment = require('../models/Assessment');

const seedDefaultData = async () => {
  try {
    // Seed default users if none exist
    const adminExists = await User.findOne({ email: 'admin@kevalontechnology.in' });
    if (!adminExists) {
      await User.create({
        name: 'Kevalon Admin',
        email: 'admin@kevalontechnology.in',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
      });
      console.log('Seeded Admin user: admin@kevalontechnology.in');
    }

    const hrExists = await User.findOne({ email: 'hr@kevalontechnology.in' });
    if (!hrExists) {
      await User.create({
        name: 'HR Manager',
        email: 'hr@kevalontechnology.in',
        password: 'Hr@123',
        role: 'hr',
        isActive: true,
      });
      console.log('Seeded HR user: hr@kevalontechnology.in');
    }

    const theoryExists = await User.findOne({ email: 'theory@kevalontechnology.in' });
    if (!theoryExists) {
      await User.create({
        name: 'Theory Evaluator',
        email: 'theory@kevalontechnology.in',
        password: 'Theory@123',
        role: 'theory',
        isActive: true,
      });
      console.log('Seeded Theory user: theory@kevalontechnology.in');
    }

    const practicalExists = await User.findOne({ email: 'practical@kevalontechnology.in' });
    if (!practicalExists) {
      await User.create({
        name: 'Practical Evaluator',
        email: 'practical@kevalontechnology.in',
        password: 'Practical@123',
        role: 'practical',
        isActive: true,
      });
      console.log('Seeded Practical user: practical@kevalontechnology.in');
    }

    // Seed sample theory questions if collection empty
    const theoryCount = await TheoryQuestion.countDocuments();
    let seedTheory1, seedTheory2;
    if (theoryCount === 0) {
      seedTheory1 = await TheoryQuestion.create({
        questionText: 'Which keyword is used to declare a block-scoped variable in JavaScript?',
        options: [
          { label: 'A', text: 'var' },
          { label: 'B', text: 'let' },
          { label: 'C', text: 'global' },
          { label: 'D', text: 'define' },
        ],
        correctAnswer: 'B',
        category: 'JavaScript Fundamentals',
        difficulty: 'easy',
        marks: 1,
        explanation: 'The `let` keyword declares a block-scoped local variable.',
        source: 'manual',
        status: 'published',
      });

      seedTheory2 = await TheoryQuestion.create({
        questionText: 'What is the primary function of Node.js event loop?',
        options: [
          { label: 'A', text: 'To compile C++ code into binary' },
          { label: 'B', text: 'To handle asynchronous operations concurrently' },
          { label: 'C', text: 'To format JSON API responses' },
          { label: 'D', text: 'To style HTML DOM elements' },
        ],
        correctAnswer: 'B',
        category: 'Node.js Core',
        difficulty: 'medium',
        marks: 2,
        explanation: 'The event loop allows Node.js to perform non-blocking I/O operations.',
        source: 'manual',
        status: 'published',
      });
      console.log('Seeded sample Theory Questions');
    }

    // Seed sample practical task if collection empty
    const practicalCount = await PracticalQuestion.countDocuments();
    let seedPractical1;
    if (practicalCount === 0) {
      seedPractical1 = await PracticalQuestion.create({
        title: 'Build a Responsive Candidate Search Filter Component',
        description: 'Create a React component that takes a list of candidates and filters them dynamically by search query, department, and status.',
        instructions: 'Include debounced search input and select dropdowns for department filtering.',
        expectedOutput: 'Clean, working React functional component using Tailwind CSS.',
        technologies: ['React', 'Tailwind CSS', 'JavaScript'],
        category: 'Frontend Development',
        difficulty: 'medium',
        marks: 20,
        timeLimit: 45,
        source: 'manual',
        status: 'published',
      });
      console.log('Seeded sample Practical Task');
    }

    // Seed candidate if empty
    const candidateCount = await Candidate.countDocuments();
    let seedCandidate1;
    if (candidateCount === 0) {
      seedCandidate1 = await Candidate.create({
        name: 'John Patel',
        email: 'john.patel@example.com',
        phone: '+91 98765 43210',
        position: 'Frontend Developer',
        department: 'Software Engineering',
        experience: '3 Years',
        status: 'active',
      });
      console.log('Seeded sample Candidate John Patel');
    }

    // Seed default assessment if empty
    const assessmentCount = await Assessment.countDocuments();
    if (assessmentCount === 0 && seedTheory1 && seedPractical1) {
      await Assessment.create({
        title: 'Full Stack Frontend Developer Assessment',
        description: 'Comprehensive evaluation covering JavaScript fundamentals and React practical development.',
        theoryQuestions: [seedTheory1._id, seedTheory2._id],
        practicalTasks: [seedPractical1._id],
        totalDuration: 60,
        passingMarksPercentage: 60,
        status: 'published',
      });
      console.log('Seeded sample Assessment');
    }

    // Seed default activity logs / notifications if empty
    const ActivityLog = require('../models/ActivityLog');
    const logCount = await ActivityLog.countDocuments();
    if (logCount === 0) {
      await ActivityLog.create([
        {
          userEmail: 'admin@kevalontechnology.in',
          userRole: 'admin',
          action: 'SYSTEM_INIT',
          module: 'System',
          description: 'Kevalon Technology Management System initialized successfully.',
          isRead: false,
        },
        {
          userEmail: 'hr@kevalontechnology.in',
          userRole: 'hr',
          action: 'CANDIDATE_ADDED',
          module: 'Candidates',
          description: 'New candidate John Patel registered for Full Stack Assessment.',
          isRead: false,
        },
        {
          userEmail: 'theory@kevalontechnology.in',
          userRole: 'theory',
          action: 'QUESTION_ADDED',
          module: 'Theory',
          description: 'New JavaScript & Node.js theory questions published to Question Bank.',
          isRead: false,
        },
        {
          userEmail: 'practical@kevalontechnology.in',
          userRole: 'practical',
          action: 'TASK_CREATED',
          module: 'Practical',
          description: 'Practical task "Build Candidate Search Component" assigned to assessments.',
          isRead: false,
        },
      ]);
      console.log('Seeded sample Activity Logs / Notifications');
    }
  } catch (error) {
    console.error('Error during data seeding:', error.message);
  }
};

module.exports = { seedDefaultData };
