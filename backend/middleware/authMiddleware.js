const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

/**
 * @desc    Verify JWT token, verify active account status & protect route
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Strict check of Authorization header format: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(\S+)$/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  // 2. Strict check: process.env.JWT_SECRET must be defined (no hardcoded fallback)
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: process.env.JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // 3. Verify JWT — isolated try/catch so JWT errors → 401, not DB errors
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtError) {
    // Covers TokenExpiredError, JsonWebTokenError, NotBeforeError
    console.error('JWT verification failed:', jwtError.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }

  // 4. Query database — isolated try/catch so Prisma errors → 500, not 401
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        statut: true,
        bloqueJusquA: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 4b. Strict lockout check: invalidate access even with valid token if account is locked
    if (user.bloqueJusquA && new Date(user.bloqueJusquA) > new Date()) {
      return res.status(403).json({
        message: 'Compte temporairement verrouillé. Accès refusé.'
      });
    }

    // 5. Strict status check: access refused if status is not strictly ACTIF
    if (user.statut !== 'ACTIF') {
      return res.status(403).json({
        message: 'Compte bloqué ou inactif. Accès refusé.'
      });
    }

    req.user = user;
    next();
  } catch (dbError) {
    // Prisma / database failure — must not be reported as an auth failure
    console.error('Database error in auth middleware:', dbError.message || dbError);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
