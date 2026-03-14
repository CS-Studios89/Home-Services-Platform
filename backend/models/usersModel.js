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
