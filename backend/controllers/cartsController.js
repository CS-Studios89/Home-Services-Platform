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
            const cart = await db.query(`Select * From carts Where id = $1 and status = 'active'`, [user_id]);
            if(!cart || !cart.rows || !cart.rows.length){
                db.query(`Insert Into carts(user_id, status) values($1, 'active')`);
            }
        }

        return res.json(cartItemsResult.rows);

    } catch (err) {
        next(err);
    }
}

// exports.addCartItem = async (req, res, next) => {
//     try {

//         const authHeader = req.headers['authorization'];
        
//         if (!authHeader || !authHeader.startsWith('Bearer '))
//             return res.status(401).json({ error: 'No token provided' });

//         const token = authHeader.split(' ')[1];

//         // Verify JWT
//         const payload = jwt.verify(token, process.env.JWT_SECRET);
//         // req.user = payload; // attach user_id
//         const { user_id } = payload;

//         const { cartItem } = req.body;

//         if(!cartItem || !cartItem.offeringId || !cartItem.start_at || !cartItem.end_at || !cartItem.hours){
//                 return res.status(401).json({message : "Please fill all required fields"});
//         }

        

//         return res.json({success : true, offerId : resultt});
//     } catch (err) {
//         next(err);
//     }
// }

// exports.editProviderOffer = async (req, res, next) => {
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