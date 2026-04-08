const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
 
    // Verify JWT  
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // attach user_id

    // Optional: check if token exists in DB and is not expired
    const tokenResult = await db.query(
      'SELECT * FROM sessions WHERE user_id = $1 AND token = $2 AND is_active = $3 AND expires_at >= NOW()',
      [payload.user_id, token, true]
    );

    if (!tokenResult.rows.length)
      return res.status(401).json({ error: 'Token expired or invalid' });

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;
