const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userModel = require('../models/usersModel');

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

exports.cancelBooking = async (req, res, next) => {
    let client;
    let inTransaction = false;
    try{
        client = db.connect();
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const bookingId = req.params.bookingId;

        const isBookingOwner = await userModel.isBookingOwner(user_id, bookingId);
        if(!isBookingOwner){
            return res.status(403).json({message:"You are not the owner of this booking"});
        }

        await client.query(`BEGIN`);
        inTransaction = true;

        await client.query(
            `Update bookings
                Set status = $1
                Where id = $2`
            , ["Cancelled", bookingId]);

        await client.query(
            `Delete From time_slots Where booking_id = $1`
        , [bookingId]);

        await client.query(`COMMIT`);
        inTransaction = false;

        return res.json({success:true});
    } catch (err) {
        if (inTransaction) {
            try { await client.query('ROLLBACK'); } catch (_) { }
        }
        next(err);
    }
    finally {
        // ALWAYS release back to pool
        try{
            if(client) client.release();
        }
        catch(err){}
    }
}

exports.getBookingRequests = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const isProvider = userModel.isAProvider(user_id);
        if(!isProvider){
            return res.status(403).json({message:"You are not a provider"});
        }

        const bookingResult = await db.query(
            `Select b.id booking_id, b.status booking_status, oi.start_at, oi.end_at, 
                oi.price, oi.hours, oi.total, or.curr, o.title, s.name service_name, u.name client_name, 
                a.country, a.city, a.street, a.building, a.floor, a.apartment
            From bookings b, order_items oi, orders or, offerings o, 
                services s, providers p, users u, address a
            Where p.id = $1 and oi.id = b.order_item_id and or.id = oi.order_id
                and o.id = oi.offering_id and s.id = o.service_id and p.id = o.provider_id
                and u.id = b.user_id and a.id = b.addr_id and b.status = $2`
        , [user_id, "requested"]);

        return res.json(bookingResult.rows);
    }
    catch(err){
        next(err);
    }
}

exports.acceptBooking = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;
        const bookingId = req.params.bookingId;

        const isBookingProvider = userModel.isBookingProvider(user_id, bookingId);
        if(!isBookingProvider){
            return res.status(403).json({message:"You are not the Provider for this booking"});
        }

        await db.query(
            `Update bookings Set status = $1 Where id = $2`
        , ["accepted", bookingId]);

        return res.json({success:true});
    }
    catch(err){
        next(err);
    }
}