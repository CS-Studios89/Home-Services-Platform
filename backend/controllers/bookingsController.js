const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.getBookings = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const bookingResult = await db.query(
            `Select 
                From bookings b, order_items oi, offerings o, services s, providers p, users u, address a`
        )
    }
    catch(err){
        next(err);
    }
}