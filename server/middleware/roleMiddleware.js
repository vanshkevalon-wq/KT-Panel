/**
 * Role & Permission Middleware for Kevalon Technology System
 */

const ROLE_PERMISSIONS = {
  admin: ['*'],
  hr: [
    'candidate.view',
    'candidate.create',
    'candidate.update',
    'candidate.delete',
    'assessment.view',
    'assessment.assign',
    'result.view',
  ],
  theory: [
    'theory.question.view',
    'theory.question.create',
    'theory.question.update',
    'theory.question.delete',
    'assessment.view',
    'result.view',
  ],
  practical: [
    'practical.question.view',
    'practical.question.create',
    'practical.question.update',
    'practical.question.delete',
    'assessment.view',
    'result.view',
  ],
};

/**
 * Middleware restricting route access to specified roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin always has full access
    if (req.user.role === 'admin') {
      return next();
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      message: `403 Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
    });
  };
};

/**
 * Middleware checking specific permission key (supports Admin override and custom user permissions)
 */
const checkPermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const defaultRolePermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const customUserPermissions = req.user.customPermissions || [];

    const hasPermission =
      defaultRolePermissions.includes('*') ||
      defaultRolePermissions.includes(permissionKey) ||
      customUserPermissions.includes(permissionKey);

    if (hasPermission) {
      return next();
    }

    return res.status(403).json({
      message: `403 Forbidden: Missing required permission '${permissionKey}'.`,
    });
  };
};

module.exports = {
  authorizeRoles,
  checkPermission,
  ROLE_PERMISSIONS,
};
