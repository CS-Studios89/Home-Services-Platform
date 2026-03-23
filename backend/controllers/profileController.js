const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.getProfileInfo = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
                
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        const infoResult = await db.query(
            `SELECT u.id, u.name, u.email, u.role, u.status,
                a.country, a.city, a.street, a.building, a.floor, a.apartment
             FROM users u, addresses a WHERE u.id = $1 and a.id = u.addr_id`
        , [user_id]);

        return res.json(infoResult.rows[0]);
    } catch (err) {
        next(err);
    }
}


exports.updateProfileInfo = async (req, res, next) => {
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

        const newInfo = req.body.newInfo || null;
        if(!newInfo){
            return res.status(400).json({message:"no info provided"});
        }

        let index = 0;
        let variablesArray = [];
        let finalQuery;
        let tmp = userQueryBuilder(newInfo, "", index, variablesArray);
        let userQuery = tmp[0];
        index = tmp[1];

        await client.query("BEGIN");
        inTransaction = true;

        if(userQuery.length > 0){
            while(true){
                if(userQuery[0] == ',' || userQuery[0] == ' '){
                    userQuery = userQuery.substring(1);
                }
                else{
                    break;
                }
            }
            
            variablesArray.push(user_id);
            finalQuery = `UPDATE users SET ${userQuery} Where id = $${++index}`;
            const infoResult = await client.query(
                finalQuery
            , variablesArray);
        }

        index = 0;
        variablesArray = [];
        tmp = addressQueryBuilder(newInfo, "", index, variablesArray);
        let addressQuery = tmp[0];
        index = tmp[1];
        
        if(addressQuery.length > 0){
            while(true){
                if(addressQuery[0] == ',' || addressQuery[0] == ' '){
                    addressQuery = addressQuery.substring(1);
                }
                else{
                    break;
                }
            }

            const addressReadRes = await client.query(
                `Select addr_id From users Where id = $1`
            , [user_id]);
            
            variablesArray.push(addressReadRes.rows[0].addr_id);

            finalQuery = `UPDATE addresses SET ${addressQuery} Where id = $${++index}`;

            const addressResult = await client.query(
                finalQuery
            , variablesArray);
        }
        
        await client.query("COMMIT");
        inTransaction = false;

        return res.json({status:"success"});
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

function userQueryBuilder(newInfo, query, index, varArr){
    if(newInfo.name && newInfo.name.length > 0){
        query += `name = $${++index}`;
        varArr.push(newInfo.name);
    }
    return [query, index];
}

function addressQueryBuilder(newInfo, query, index, varArr){
    if(newInfo.country && newInfo.country.length > 0){
        query += `country = $${++index}`
        varArr.push(newInfo.country);
    }

    if(newInfo.city && newInfo.city.length > 0){
        query += `, city = $${++index}`
        varArr.push(newInfo.city);
    }

    if(newInfo.street && newInfo.street.length > 0){
        query += `, street = $${++index}`
        varArr.push(newInfo.street);
    }

    if(newInfo.building && newInfo.building.length > 0){
        query += `, building = $${++index}`
        varArr.push(newInfo.building);
    }

    if(newInfo.floor !== undefined && newInfo.floor !== null && newInfo.floor > 0){
        query += `, floor = $${++index}`
        varArr.push(newInfo.floor);
    }

    if(newInfo.apartment && newInfo.apartment.length > 0){
        query += `, apartment = $${++index}`
        varArr.push(newInfo.apartment);
    }

    return [query, index];
}

