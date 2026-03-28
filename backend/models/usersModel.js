const db = require('../config/db');

exports.isAProvider = async (user_id) => {
    const userResults = await db.query(
        `SELECT role FROM users WHERE id = $1`,
        [user_id]
    );

    if(userResults.rows && userResults.rows[0].role === "provider"){
        return true;
    }

    return false;
}

exports.isOfferOwner = async (user_id, offerId) => {
    const userResults = await db.query(
        `SELECT p.id pid FROM users u, providers p, offerings o 
        WHERE u.id = $1 AND o.id = $2 AND o.provider_id = p.id AND p.user_id = u.id`,
        [user_id, offerId]
    );

    if(userResults.rows && userResults.rows[0] && userResults.rows[0].pid){
        return true;
    }

    return false;
}

exports.isCartItemOwner = async (user_id, cartItemId) => {
    const cartItemResults = await db.query(
        `SELECT u.id uid FROM users u, carts c, cart_items i
        WHERE u.id = $1 AND i.id = $2 AND u.id = c.user_id AND c.id = i.cart_id`,
        [user_id, cartItemId]
    );

    if(cartItemResults && cartItemResults.rows && cartItemResults.rows[0] && cartItemResults.rows[0].uid){
        return true;
    }

    return false;
}
