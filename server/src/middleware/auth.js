const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    // Ignore invalid public tokens on open endpoints.
    req.user = null;
  }
  next();
}

function adminOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'hospital')) {
    return res.status(403).json({ error: 'Access denied. Admin or hospital role required.' });
  }
  next();
}

module.exports = { auth, optionalAuth, adminOnly };
