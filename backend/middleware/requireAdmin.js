const db = require('../config/db');

module.exports = async function requireAdmin(req, res, next) {
  try {
    const userId = req?.user?.user_id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const role = result.rows?.[0]?.role;

    if (role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    return next();
  } catch (err) {
    return next(err);
  }
};

