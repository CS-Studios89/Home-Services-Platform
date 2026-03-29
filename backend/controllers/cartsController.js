const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userModel = require('../models/usersModel');


exports.getCartItems = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;
        
        const cartItemsResult = await db.query(
            `Select i.id, i.start_at, i.end_at, i.hours, o.title, o.rate, o.curr, s.name service_name, u.name provider_name
                From carts c, cart_items i, offerings o, services s, providers p, users u
                Where c.user_id = $1 and i.cart_id = c.id and o.id = i.offering_id
                 and s.id = o.service_id and p.id = o.provider_id and u.id = p.user_id and c.status = 'active'`
        , [user_id]);

        if(!cartItemsResult || !cartItemsResult.rows || !cartItemsResult.rows.length){
            const cart = await db.query(`Select * From carts Where user_id = $1 and status = 'active'`, [user_id]);
            if(!cart || !cart.rows || !cart.rows.length){
                db.query(`Insert Into carts(user_id, status) values($1, 'active')`);
            }
        }

        return res.json(cartItemsResult.rows);

    } catch (err) {
        next(err);
    }
}

exports.addCartItem = async (req, res, next) => {
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
        // req.user = payload; // attach user_id
        const { user_id } = payload;

        const { cartItem } = req.body;

        if(!cartItem || !cartItem.offeringId || !cartItem.start_at || !cartItem.end_at){
                return res.status(401).json({message : "Please fill all required fields"});
        }

        await client.query('BEGIN');
        inTransaction = true;

        let cartId;
        const cart = await client.query(`Select * From carts Where user_id = $1 and status = 'active'`, [user_id]);
        if(!cart || !cart.rows || !cart.rows.length){
            const newCart = await client.query(`Insert Into carts(user_id, status) values($1, 'active') Returning id`, [user_id]);
            cartId = newCart.rows[0].id;
        }
        else{
            cartId = cart.rows[0].id;
        }

        const busyTimes = await client.query(
            `Select t.start_at, t.end_at
            From time_slots t, offerings o
            Where o.id = $1 and t.provider_id = o.provider_id`
        , [cartItem.offeringId]);

        let validTime = true;
        if(busyTimes && busyTimes.rows && busyTimes.rows.length){
            for(let i = 0; i < busyTimes.rows.length; i++){
                if(cartItem.start_at >= new Date(busyTimes.rows[i].start_at).getTime() 
                    && cartItem.start_at < new Date(busyTimes.rows[i].end_at).getTime() 
                    ||
                    cartItem.end_at > new Date(busyTimes.rows[i].start_at).getTime()
                    && cartItem.end_at <= new Date(busyTimes.rows[i].end_at).getTime()){
                        validTime = false;
                        break;
                    }
            }
        }

        if(!validTime){
            await client.query(`ROLLBACK`);
            inTransaction = false;
            return res.status(400).json({message:"Provider is busy during the selected time"});
        }

        await client.query(
            `Insert Into cart_items(cart_id, offering_id, start_at, end_at, hours)
                values($1, $2, $3, $4, $5)`
        , [cartId, cartItem.offeringId, new Date(cartItem.start_at).toISOString(), new Date(cartItem.end_at).toISOString(), 
            Math.ceil(Math.floor((new Date(cartItem.end_at).getTime() - new Date(cartItem.start_at).getTime())/(1000*60*60)*1000)/1000)]);

        await client.query(`COMMIT`);
        inTransaction = false;
        
        return res.json({success : true});
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

exports.editCartItem = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = payload; // attach user_id
        const { user_id } = payload;


        const cartItemId = req.params.cartItemId;
        if(!cartItemId){
            return res.status(401).json({message : "Invalid Cart Item Id"});
        }

        const isCartItemOwner = await userModel.isCartItemOwner(user_id, cartItemId);
        if(!isCartItemOwner){
            return res.status(401).json({message : "You are not the owner of this item"});
        }

        const { cartItem } = req.body;

        if(!cartItem || !cartItem.start_at || !cartItem.end_at){
            return res.status(401).json({message : "Please fill all required fields"});
        }

        const patchResult = await db.query(
            `Update cart_items
            Set start_at = $2, end_at = $3, hours = $4
            Where id = $1`
        , [cartItemId, new Date(cartItem.start_at).toISOString(), new Date(cartItem.end_at).toISOString(),
            Math.ceil(Math.floor((new Date(cartItem.end_at).getTime() - new Date(cartItem.start_at).getTime())/(1000*60*60)*1000)/1000)
        ]);

        if(!patchResult){
            return res.status(401).json({message : "Failed to update offer data"});
        }

        return res.json({success: true});
    }
    catch(err){
        next(err);
    }
}

exports.deleteCartItem = async (req, res, next) => { 
    try{
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = payload; // attach user_id
        const { user_id } = payload;


        const cartItemId = req.params.cartItemId;
        if(!cartItemId){
            return res.status(401).json({message : "Invalid Cart Item Id"});
        }

        const isCartItemOwner = await userModel.isCartItemOwner(user_id, cartItemId);
        if(!isCartItemOwner){
            return res.status(401).json({message : "You are not the owner of this item"});
        }

        const deleteResult = await db.query(
            `Delete From cart_items Where id = $1`
        , [cartItemId]);

        if(!deleteResult){
            return res.status(400).json({message:"Failed to delete item"});
        }

        return res.json({success: true});
    }
    catch(err){
        next(err);
    }
}

exports.cartCheckout = async (req, res, next) => {
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
        // req.user = payload; // attach user_id
        const { user_id } = payload;

        const cartItemsResult = await db.query(
            `Select i.id, i.offering_id, i.start_at, i.end_at, i.hours, o.rate, o.curr
                From carts c, cart_items i, offerings o
                Where c.user_id = $1 and i.cart_id = c.id and o.id = i.offering_id and c.status = 'active'`
        , [user_id]);

        let totalAmount = 0;
        for(let i = 0; i < cartItemsResult.rows.length; i++){
            totalAmount += convertCurrency(cartItemsResult.rows[i].hours * cartItemsResult.rows[i].rate, cartItemsResult.rows[i].curr, "USD");
        }

        await client.query(`BEGIN`);
        inTransaction = true;

        const orderResult = await client.query(
            `Insert Into orders(user_id, status, total, curr)
                values($1, $2, $3, $4)
                Returning id`
        , [user_id, "pending_payment", totalAmount, "USD"]);

        const orderId = orderResult.rows[0].id;

        for(let i = 0; i < cartItemsResult.rows.length; i++){
            await client.query(
                `Insert Into order_items(order_id, offering_id, start_at, end_at, hours, price, total)
                values($1, $2, $3, $4, $5, $6, $7)`
            , [
                orderId,
                cartItemsResult.rows[i].offering_id,
                cartItemsResult.rows[i].start_at,
                cartItemsResult.rows[i].end_at,
                cartItemsResult.rows[i].hours,
                cartItemsResult.rows[i].rate,
                cartItemsResult.rows[i].hours * cartItemsResult.rows[i].rate]
            );
        }

        await client.query(
            `Update carts Set status = 'checked_out' Where user_id = $1`
        , [user_id]);

        await client.query(`Insert Into carts(user_id, status) values($1, 'active')`, [user_id]);

        await client.query(`COMMIT`);

        return res.json({success: true});

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

function convertCurrency(amount, from, to) {
    const rates = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.78,
      JPY: 150,
      AUD: 1.5,
      CAD: 1.35,
      CHF: 0.88,
      CNY: 7.2,
      AED: 3.67,
      SAR: 3.75
    };
  
    if (!rates[from] || !rates[to]) {
      throw new Error("Unsupported currency");
    }
  
    const usdAmount = amount / rates[from]; // normalize to USD
    return usdAmount * rates[to];
}