const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Candidate = require('../models/Candidate');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kevalon_super_secret_jwt_key_2026_production');

      if (decoded.role === 'candidate') {
        const candidate = await Candidate.findById(decoded.id);
        if (!candidate) {
          return res.status(401).json({ message: 'Candidate account record not found.' });
        }
        if (candidate.status === 'inactive') {
          return res.status(403).json({ message: 'Your candidate account has been deactivated. Contact Admin.' });
        }

        req.candidate = candidate;
        req.user = {
          _id: candidate._id,
          id: candidate._id,
          candidateId: candidate._id,
          name: candidate.name,
          email: candidate.email,
          role: 'candidate',
          isCandidate: true,
          enrollmentNumber: candidate.enrollmentNumber,
        };
        return next();
      }

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User account no longer exists.' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Your user account has been deactivated. Contact Admin.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

module.exports = { protect };
