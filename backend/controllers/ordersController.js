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

exports.getOrderItems = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const orderId = req.params.orderId;
        const orderResult = await db.query(`Select * From orders Where id = $1`, [orderId]);
        if(!orderResult || ! orderResult.rows || !orderResult.rows.length){
            return res.status(400).json({message : "Invalid order Id"});
        }

        const isOrderOwner = userModel.isOrderOwner(user_id, orderId);
        if(!isOrderOwner){
            return res.status(400).json({message:"You are not the owner of this order"});
        }

        const orderItemsResult = db.query(
            `Select i.id, i.start_at, i.end_at, i.hours, i.price, i.total, o.title, s.name service_name, u.name provider_name
                From order_items i, offerings o, providers p, users u
                Where i.order_id = $1 and o.id = i.offering_id and p.id = o.provider_id and s.id = o.service_id and u.id = p.user_id`
        , [orderId]);

        return res.json(orderItemsResult.rows);
    }
    catch(err){
        next(err);
    }
}