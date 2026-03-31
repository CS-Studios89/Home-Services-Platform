const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userModel = require('../models/usersModel');
const currencyModel = require('../models/currencyModel');

exports.getPayments = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const paymentsResult = await db.query(
            `Select * From payments Where user_id = $1`
        , [user_id]);

        return res.json(paymentsResult.rows);
    } catch (err) {
        next(err);
    }
}

exports.makePayment = async (req, res, next) => {
    let client;
    let inTransaction = false;
    try {
        client = await db.connect();

        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const {info} = req.body;

        if(!info || !info.order_id || !info.method || !info.type || !info.amount || !info.curr){
            return res.status(400).json({message:"Fill all reuqired fields"});
        }
        const orderId = info.order_id;

        if(!userModel.isOrderOwner(user_id, info.order_id)){
            return res.status(400).json({message:"You are not the owner of this order"});
        }

        const orderItemsResult = await client.query(
            `Select i.id, i.offering_id, i.start_at, i.end_at, i.hours, i.price, i.total, o.title, s.name service_name, u.name provider_name
                From order_items i, offerings o, providers p, users u, services s
                Where i.order_id = $1 and o.id = i.offering_id and p.id = o.provider_id and s.id = o.service_id and u.id = p.user_id`
        , [orderId]);

        const orderResult = await client.query(`Select * From orders Where id = $1`, [orderId]);
        let map = new Map();
        for(let i = 0; i < orderItemsResult.rows.length; i++){
            const busyTimes = await client.query(
                `Select t.start_at, t.end_at, o.provider_id
                From time_slots t, offerings o
                Where o.id = $1 and t.provider_id = o.provider_id`
            , [orderItemsResult.rows[i].offering_id]);

            if (!map.has(orderItemsResult.rows[i].provider_id)) {
                map.set(orderItemsResult.rows[i].provider_id, []);
            }      
            map.get(orderItemsResult.rows[i].provider_id)
            .push([
                new Date(orderItemsResult.rows[i].start_at).getTime(),
                new Date(orderItemsResult.rows[i].end_at).getTime()
            ]);

            let validTime = true;
            if(busyTimes && busyTimes.rows && busyTimes.rows.length){
                for(let i = 0; i < busyTimes.rows.length; i++){
                    if(cartItem.start_at >= new Date(busyTimes.rows[i].start_at).getTime() 
                        && cartItem.start_at < new Date(busyTimes.rows[i].end_at).getTime() 
                        ||
                        cartItem.end_at > new Date(busyTimes.rows[i].start_at).getTime()
                        && cartItem.end_at <= new Date(busyTimes.rows[i].end_at).getTime()
                        ||
                        new Date(busyTimes.rows[i].start_at).getTime() >= cartItem.start_at
                        && new Date(busyTimes.rows[i].start_at).getTime() < cartItem.end_at
                        ||
                        new Date(busyTimes.rows[i].end_at).getTime() > cartItem.start_at
                        && new Date(busyTimes.rows[i].end_at).getTime() <= cartItem.end_at){
                            validTime = false;
                            break;
                        }
                }
            }

            if(!validTime){
                return res.status(400).json({message:"Provider is busy during the selected time"});
            }
        }

        Array.from(map.keys()).forEach(k => {
            for(let i = 0; i < map.get(k).length-1; i++){
                const arr1 = map.get(k)[i];
                for(let j = i+1; j < map.get(k).length; j++){
                    const arr2 = map.get(k)[j];
                    if(arr1[0] >= arr2[0] && arr1[0] < arr2[1] 
                        ||
                        arr1[1] > arr2[0] && arr1[1] <= arr2[1]
                        ||
                        arr2[0] >= arr1[0] && arr2[0] < arr1[1] 
                        ||
                        arr2[1] > arr1[0] && arr2[1] <= arr1[1]
                    ){
                        return res.status(400).json({message:"order items for same provider have overlapping time_slots"});
                    }
                }
            }
        })

        if(info.type == "full" && 
            Math.abs(currencyModel.convertCurrency(info.amount, info.curr, 'USD') -
            currencyModel.convertCurrency(orderResult.rows[0].total, orderResult.rows[0].curr, 'USD'))
            >= 0.01
        ){
            return res.status(400).json({message:"Insufficient Amount, you need to pay " + 
                currencyModel.convertCurrency(orderResult.rows[0].total, orderResult.rows[0].curr, "USD")
                + " USD  or equivalent"
            });
        }

        await client.query(`BEGIN`);
        inTransaction = true;

        await client.query(`
            Insert Into payments(order_id, method, type, status, amount, curr)
                values($1, $2, $3, $4, $5, $6)`
            ,[info.orderId, info.method, initOracleClient.type, "ok", info.amount, info.curr]);
        
        await client.query(
            `Update orders Set status = 'paid' Where id = $1`, [orderId]
        );

        const addrId = await client.query(`Select addr_id From users Where id = $1`, [user_id]).rows[0].addr_id;

        for(let i = 0; i < orderItemsResult.rows.length; i++){
            const providerId = await client.query(
                `Select o.provider_id From order_items i, offerings o
                Where i.id = $1 and o.id = i.offering_id`
            , [orderItemsResult.rows[i].id]).rows[0].provider_id;

            const bookingId = await client.query(
                `Insert Into bookings(order_item_id, user_id, addr_id, status)
                values($1, $2, $3, $4)
                Returning id`
            , [orderItemsResult.rows[i].id, user_id, addrId, 'requested']).rows[0].id;

            await client.query(
                `Insert Into time_slots(provider_id, booking_id, start_at, end_at)
                values($1, $2, $3, $4)`
            , [providerId, bookingId, 
                new Date(orderItemsResult.rows[i].start_at).toISOString(),
                new Date(orderItemsResult.rows[i].end_at).toISOString()]);
        }

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