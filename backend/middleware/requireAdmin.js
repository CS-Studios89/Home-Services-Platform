const db = require('../config/db');
const jwt = require('jsonwebtoken');
 
module.exports = async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.authHeader['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];

    //verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Attach user_id
    const userId = payload.user_id;

    const result = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = result.rows?.[0]?.role;

    if (role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    return next();
  } catch (err) {
    return next(err);
  }
};

