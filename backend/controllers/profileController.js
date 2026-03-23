const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.getProfileInfo = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
                
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const infoResult = await db.query(
            `SELECT u.id, u.name, u.email, u.role, u.status,
                a.country, a.city, a.street, a.building, a.floor, a.apartment
             FROM users u, addresses a WHERE u.id = $1 and a.id = u.addr_id`
        , [user_id]);

        return res.json(infoResult.rows[0]);
    } catch (err) {
        next(err);
    }
}




