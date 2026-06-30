const jwt = require('jsonwebtoken');
const SECRET = process.env.SUPERADMIN_JWT_SECRET || 'superadmin_dev_secret';

module.exports = function superAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, SECRET);
    if (payload.role !== 'superadmin') return res.status(403).json({ error: 'Acceso denegado' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
};
