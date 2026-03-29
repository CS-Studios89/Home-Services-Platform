const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.getOrders = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const ordersResult = await db.query(
            `Select id, status, curr, total, created_at
                From orders Where user_id = $1`
        , [user_id]);

        return res.json(ordersResult.rows);
    } catch (err) {
        next(err);
    }
}