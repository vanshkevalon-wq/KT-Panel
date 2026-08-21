const Skill = require('../models/Skill');
const { logActivity } = require('../services/auditLogService');

// @desc    Get all skills / role master
// @route   GET /api/skills
// @access  Private (Authenticated users)
const getSkills = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status === 'active') {
      query.isActive = true;
    }

    const skills = await Skill.find(query).sort({ name: 1 });
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new skill / role master
// @route   POST /api/skills
// @access  Private (Admin)
const createSkill = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Skill name is required.' });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const existingSkill = await Skill.findOne({
      $or: [{ name: name.trim() }, { slug }],
    });

    if (existingSkill) {
      return res.status(400).json({ message: `Skill '${name.trim()}' already exists.` });
    }

    const skill = await Skill.create({
      name: name.trim(),
      slug,
      description: description || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'CREATE_SKILL',
      module: 'SKILL_MANAGEMENT',
      description: `Admin created new role/skill '${skill.name}'.`,
      req,
    });

    res.status(201).json(skill);
  } catch (error) {
    next(error);
  }
};

// @desc    Update skill / role master
// @route   PUT /api/skills/:id
// @access  Private (Admin)
const updateSkill = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    if (name && name.trim()) {
      skill.name = name.trim();
      skill.slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    if (description !== undefined) skill.description = description;
    if (typeof isActive === 'boolean') skill.isActive = isActive;

    await skill.save();

    await logActivity({
      user: req.user,
      action: 'UPDATE_SKILL',
      module: 'SKILL_MANAGEMENT',
      description: `Admin updated role/skill '${skill.name}'.`,
      req,
    });

    res.json(skill);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin)
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    skill.isActive = false;
    await skill.save();

    await logActivity({
      user: req.user,
      action: 'DEACTIVATE_SKILL',
      module: 'SKILL_MANAGEMENT',
      description: `Admin deactivated role/skill '${skill.name}'.`,
      req,
    });

    res.json({ message: `Skill '${skill.name}' deactivated successfully.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};
