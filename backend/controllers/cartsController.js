const db = require('../config/db');
const jwt = require('jsonwebtoken');


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
            `Select i.start_at, i.end_at, i.hours, o.title, o.rate, o.curr, s.name service_name, u.name provider_name
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

        if(!cartItem || !cartItem.offeringId || !cartItem.start_at || !cartItem.end_at || !cartItem.hours){
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
        );

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

// exports.editCartItem = async (req, res, next) => {
//     try{
//         const authHeader = req.headers['authorization'];
        
//         if (!authHeader || !authHeader.startsWith('Bearer '))
//             return res.status(401).json({ error: 'No token provided' });

//         const token = authHeader.split(' ')[1];

//         // Verify JWT
//         const payload = jwt.verify(token, process.env.JWT_SECRET);
//         // req.user = payload; // attach user_id
//         const { user_id } = payload;

//         const isProvider = await userModel.isAProvider(user_id);
//         if(!isProvider){
//             return res.status(401).json({message : "You are not a provider"});
//         }

//         const offeringId = req.params.offeringId;
//         if(!offeringId){
//             return res.status(401).json({message : "Invalid Offering Id"});
//         }

//         const isOfferOwner = await userModel.isOfferOwner(user_id, offeringId);
//         if(!isOfferOwner){
//             return res.status(401).json({message : "You are not the owner of this offering"});
//         }

//         const { offer } = req.body;

//         if(!offer.title || offer.rate == null || offer.rate == undefined ||
//             !offer.curr || offer.active == null || offer.active == undefined || !offer.service_id){
//                 return res.status(401).json({message : "Please fill all required fields"});
//         }

//         const patchResult = await offeringsModel.updateOffer(offeringId, offer);
//         if(!patchResult){
//             return res.status(401).json({message : "Failed to update offer data"});
//         }

//         return res.json({success: true});
//     }
//     catch(err){
//         next(err);
//     }
// }

// exports.deleteProviderOffer = async (req, res, next) => { 
//     try{
//         const authHeader = req.headers['authorization'];
        
//         if (!authHeader || !authHeader.startsWith('Bearer '))
//             return res.status(401).json({ error: 'No token provided' });

//         const token = authHeader.split(' ')[1];

//         // Verify JWT
//         const payload = jwt.verify(token, process.env.JWT_SECRET);
//         // req.user = payload; // attach user_id
//         const { user_id } = payload;

//         const isProvider = await userModel.isAProvider(user_id);
//         if(!isProvider){
//             return res.status(401).json({message : "You are not a provider"});
//         }

//         const offeringId = req.params.offeringId;
//         if(!offeringId){
//             return res.status(401).json({message : "Invalid Offering Id"});
//         }

//         const isOfferOwner = await userModel.isOfferOwner(user_id, offeringId);
//         if(!isOfferOwner){
//             return res.status(401).json({message : "You are not the owner of this offering"});
//         }

//         const deleteResult = await offeringsModel.deleteOffer(offeringId);
//         if(!deleteResult){
//             return res.status(401).json({message : "Failed to delete offer"});
//         }

//         return res.json({success: true});
//     }
//     catch(err){
//         next(err);
//     }
// }