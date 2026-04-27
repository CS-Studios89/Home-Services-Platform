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

exports.isOrderOwner = async (user_id, orderId) => {
    const orderResult = await db.query(
        `SELECT u.id uid FROM users u, orders o
        WHERE u.id = $1 AND o.id = $2 AND o.user_id = u.id`,
        [user_id, orderId]
    );

    if(orderResult && orderResult.rows && orderResult.rows[0] && orderResult.rows[0].uid){
        return true;
    }

    return false;
}

exports.isBookingOwner = async(user_id, bookingId) => {
    const bookingResult = await db.query(
        `SELECT u.id uid FROM users u, bookings b
        WHERE u.id = $1 AND b.id = $2 AND b.user_id = u.id`,
        [user_id, bookingId]
    );

    if(bookingResult && bookingResult.rows && bookingResult.rows[0] && bookingResult.rows[0].uid){
        return true;
    }

    return false;
}

exports.isBookingProvider = async(user_id, bookingId) => {
    const bookingResult = await db.query(
        `SELECT p.user_id uid FROM bookings b, order_items oi, offerings o, providers p
        WHERE p.user_id = $1 AND b.id = $2 AND oi.id = b.order_item_id 
        and o.id = oi.offering_id and p.id = o.provider_id`,
        [user_id, bookingId]
    );

    if(bookingResult && bookingResult.rows && bookingResult.rows[0] && bookingResult.rows[0].uid){
        return true;
    }

    return false;
}