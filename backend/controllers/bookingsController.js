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
            `Select b.id booking_id, b.status booking_status, oi.start_at, oi.end_at, 
                oi.price, oi.hours, oi.total, or.curr, o.title, s.name service_name, u.name provider_name, 
                a.country, a.city, a.street, a.building, a.floor, a.apartment
            From bookings b, order_items oi, orders or, offerings o, 
                services s, providers p, users u, address a
            Where b.user_id = $1 and oi.id = b.order_item_id and or.id = oi.order_id
                and o.id = oi.offering_id and s.id = o.service_id and p.id = o.provider_id
                and u.id = p.user_id and a.id = b.addr_id`
        , [user_id]);

        return res.json(bookingResult.rows);
    }
    catch(err){
        next(err);
    }
}