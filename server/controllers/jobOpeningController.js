const JobOpening = require('../models/JobOpening');

// Initial Default Seed Positions
const defaultOpenings = [
  {
    title: 'Senior Full Stack Developer (Node.js + React)',
    category: 'Full Stack',
    department: 'Engineering',
    experience: '3 - 5 Years',
    location: 'Ahmedabad / Hybrid',
    type: 'Full-Time',
    tags: ['React.js', 'Node.js', 'MongoDB', 'AWS', 'Tailwind CSS'],
    status: 'active',
  },
  {
    title: 'Frontend Engineer (React & Next.js)',
    category: 'Frontend',
    department: 'Web Development',
    experience: '1 - 3 Years',
    location: 'Solaris Hub, Ahmedabad',
    type: 'Full-Time',
    tags: ['React.js', 'Next.js', 'TypeScript', 'Tailwind'],
    status: 'active',
  },
  {
    title: 'Python / AI Backend Engineer',
    category: 'Backend',
    department: 'AI & Data Labs',
    experience: '2 - 4 Years',
    location: 'Ahmedabad / Remote',
    type: 'Full-Time',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Generative AI'],
    status: 'active',
  },
  {
    title: 'Quality Assurance & Test Automation Engineer',
    category: 'QA',
    department: 'Quality Assurance',
    experience: '1 - 3 Years',
    location: 'Solaris Hub, Ahmedabad',
    type: 'Full-Time',
    tags: ['Cypress', 'Playwright', 'Jest', 'API Testing'],
    status: 'active',
  },
  {
    title: 'UI/UX Product Designer',
    category: 'Design',
    department: 'Product & Design',
    experience: '2+ Years',
    location: 'Solaris Hub, Ahmedabad',
    type: 'Full-Time',
    tags: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    status: 'active',
  },
];

// Seed Job Openings if Database is Empty
const seedJobOpeningsIfEmpty = async () => {
  try {
    const count = await JobOpening.countDocuments();
    if (count === 0) {
      await JobOpening.insertMany(defaultOpenings);
      console.log('Default job openings seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding job openings:', err);
  }
};

// @desc    Get Public Active Job Openings for Landing Page
// @route   GET /api/public/job-openings
// @access  Public
const getPublicJobOpenings = async (req, res, next) => {
  try {
    await seedJobOpeningsIfEmpty();
    const openings = await JobOpening.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(openings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Job Openings (Active & Hidden) for Admin
// @route   GET /api/admin/job-openings
// @access  Private (Admin, HR)
const getAllJobOpenings = async (req, res, next) => {
  try {
    await seedJobOpeningsIfEmpty();
    const openings = await JobOpening.find().sort({ createdAt: -1 });
    res.json(openings);
  } catch (error) {
    next(error);
  }
};

// @desc    Create New Job Opening
// @route   POST /api/admin/job-openings
// @access  Private (Admin, HR)
const createJobOpening = async (req, res, next) => {
  try {
    const { title, category, department, experience, location, type, tags, status, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Job title is required.' });
    }

    const opening = await JobOpening.create({
      title,
      category: category || 'Full Stack',
      department: department || 'Engineering',
      experience: experience || '1 - 3 Years',
      location: location || 'Solaris Hub, Ahmedabad',
      type: type || 'Full-Time',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      status: status || 'active',
      description: description || '',
    });

    res.status(201).json(opening);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Job Opening (Details or Status Active/Hidden)
// @route   PUT /api/admin/job-openings/:id
// @access  Private (Admin, HR)
const updateJobOpening = async (req, res, next) => {
  try {
    const { title, category, department, experience, location, type, tags, status, description } = req.body;
    const opening = await JobOpening.findById(req.params.id);

    if (!opening) {
      return res.status(404).json({ message: 'Job opening not found.' });
    }

    if (title !== undefined) opening.title = title;
    if (category !== undefined) opening.category = category;
    if (department !== undefined) opening.department = department;
    if (experience !== undefined) opening.experience = experience;
    if (location !== undefined) opening.location = location;
    if (type !== undefined) opening.type = type;
    if (tags !== undefined) {
      opening.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [];
    }
    if (status !== undefined) opening.status = status;
    if (description !== undefined) opening.description = description;

    await opening.save();
    res.json(opening);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Job Opening
// @route   DELETE /api/admin/job-openings/:id
// @access  Private (Admin)
const deleteJobOpening = async (req, res, next) => {
  try {
    const opening = await JobOpening.findByIdAndDelete(req.params.id);
    if (!opening) {
      return res.status(404).json({ message: 'Job opening not found.' });
    }
    res.json({ message: 'Job opening deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicJobOpenings,
  getAllJobOpenings,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
};
