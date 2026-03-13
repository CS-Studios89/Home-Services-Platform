const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.tokenExpiryTimeMilliSeconds = 24 * 60 * 60 * 1000;

exports.signup = async (req, res, next) => {
    let client;
    let inTransaction = false;
    try {
        client = await db.connect();

        const {
            name,
            email,
            password,
            role,
            //status, //set automatically
            //created_at, //created automatically 
            bio, // providers only
            //approved, //provider only, managed automatically
            adminPass, // for admin signup
            address
        } = req.body;

        let countryy = null;
        let cityy = null;
        let streett = null;
        let buildingg = null;
        let floorr = null;
        let apartmentt = null;

        try {
            const {
                country,
                city,
                street,
                building,
                floor,
                apartment
                //created_at, //created automatically
            } = address;

            countryy = country;
            cityy = city;
            streett = street;
            buildingg = building;
            floorr = floor;
            apartmentt = apartment;
        }
        catch (err) { }

        let country = countryy;
        let city = cityy;
        let street = streett;
        let building = buildingg;
        let floor = floorr;
        let apartment = apartmentt;


        if (!name || !email || !password || !role) {
            return res.status(400).json({ status: 400, message: "please fill all reuqired fields" });
        }

        if (role !== "client" && role !== "provider" && role !== "admin") {
            return res.status(400).json({ error: 'Invalid role' })
        }

        if (role === "provider") {
            if (!country || !city || !street || !building || floor === undefined || floor === null || !apartment || !bio) {
                return res.status(400).json({ status: 400, message: "please fill all reuqired fields" });
            }
        }

        if(role === "admin"){
            if(!adminPass || adminPass !== process.env.ADMIN_PASSKEY){
                return res.status(400).json({ status: 400, message: "Invalid Admin Password" });
            }
        }

        await client.query('BEGIN');
        inTransaction = true;

        // ---- EMAIL EXISTS ----
        const emailCheck = await client.query(
            'SELECT 1 FROM users WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length) {
            await client.query('ROLLBACK');
            inTransaction = false;
            return res.status(409).json({ error: 'Email already exists' });
        }


        // ---- ADDRESS ----
        let address_id = null;
        if (country && city && street && building && floor !== undefined && floor !== null && apartment) {
            const addressResult = await client.query(
                `
        INSERT INTO addresses (
          country, city, street, building, floor, apartment
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING id
        `,
                [country, city, street, building, floor, apartment]
            );

            address_id = addressResult.rows[0].id;
        }

        // ---- PASSWORD ----
        const hashedPassword = await bcrypt.hash(password, 10);

        // ---- USER ----
        const userResult = await client.query(
            `
      INSERT INTO users (
        email, pass, name, role, status, addr_id
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id
      `,
            [
                email,
                hashedPassword,
                name,
                role,
                "active",
                address_id
            ]
        );

        const user_id = userResult.rows[0].id;

        if (role === "provider") {
            await client.query(
                `
        INSERT INTO providers(
          user_id, approved, bio, addr_id, rating_avg, rating_count
        ) 
        VALUES($1, $2, $3, $4, $5, $6)
        `,
                [user_id, "pending", bio, address_id, 0, 0]
            );
        }


        // ---- JWT ----
        const token = jwt.sign(
            { user_id: user_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '999999999d' }
        );

        const expiresAt = new Date(Date.now() + exports.tokenExpiryTimeMilliSeconds); // expires in 24 hours
        await client.query(
            `
      INSERT INTO sessions(
      token, is_active, user_id, expires_at
      ) Values($1,$2,$3,$4)
      `,
            [token, true, user_id, expiresAt]
        );

        await client.query('COMMIT');
        inTransaction = false;

        return res.status(201).json({ token });

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
};

