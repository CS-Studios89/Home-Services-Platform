const db = require('../config/db');
const userModel = require('../models/usersModel');

exports.getProviderDetails = async (req, res, next) => {
    try{
        const providerId = req.params.providerId;

        if(providerId !== undefined && providerId !== null && providerId > -1){
            const providerResult = await db.query(
                `Select p.id, u.name, p.bio, p.rating_avg, p.rating_count, 
                    a.country, a.city, a.street, a.building, a.floor, a.apartment
                    From providers p, users u, addresses a
                    Where p.id = $1 and u.id = p.user_id and a.id = u.addr_id`
            , [providerId]);

            if(providerResult && providerResult.rows && providerResult.rows.length > 0){
                return res.json(providerResult.rows[0]);
            }
        }
        else{
            return res.status(400).json({message: "id not provided"});
        }

        return res.status(500).json({message:"operation failed"});
        
    }
    catch(err){
        next(err);
    }
}

const parseToDate = (value) => {
    if (value === null || value === undefined) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
};

exports.createBusyTimeSlot = async (req, res, next) => {
    try{
        const { user_id } = req.user || {};
        if(!user_id){
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isProvider = await userModel.isAProvider(user_id);
        if(!isProvider){
            return res.status(403).json({ message: "You are not a provider" });
        }

        const startAt = parseToDate(req.body?.start_at);
        const endAt = parseToDate(req.body?.end_at);
        if(!startAt || !endAt){
            return res.status(400).json({ message: "start_at and end_at are required valid dates" });
        }

        if(startAt >= endAt){
            return res.status(400).json({ message: "start_at must be before end_at" });
        }

        const providerResult = await db.query(
            `SELECT id FROM providers WHERE user_id = $1`,
            [user_id]
        );

        if(!providerResult.rows || providerResult.rows.length === 0){
            return res.status(404).json({ message: "Provider not found" });
        }

        const providerId = providerResult.rows[0].id;

        const overlappingSlotsResult = await db.query(
            `SELECT id FROM time_slots
            WHERE provider_id = $1
            AND start_at < $3
            AND end_at > $2
            LIMIT 1`,
            [providerId, startAt, endAt]
        );

        if(overlappingSlotsResult.rows && overlappingSlotsResult.rows.length > 0){
            return res.status(409).json({ message: "Time slot overlaps with an existing slot" });
        }

        const createResult = await db.query(
            `INSERT INTO time_slots(provider_id, start_at, end_at, booking_id)
            VALUES ($1, $2, $3, NULL)
            RETURNING id, provider_id, start_at, end_at, booking_id`,
            [providerId, startAt, endAt]
        );

        return res.status(201).json({ success: true, slot: createResult.rows[0] });
    }
    catch(err){
        next(err);
    }
};

exports.deleteBusyTimeSlot = async (req, res, next) => {
    try{
        const { user_id } = req.user || {};
        if(!user_id){
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isProvider = await userModel.isAProvider(user_id);
        if(!isProvider){
            return res.status(403).json({ message: "You are not a provider" });
        }

        const slotId = Number(req.params.slotId);
        if(!Number.isInteger(slotId) || slotId <= 0){
            return res.status(400).json({ message: "Invalid slot id" });
        }

        const providerResult = await db.query(
            `SELECT id FROM providers WHERE user_id = $1`,
            [user_id]
        );

        if(!providerResult.rows || providerResult.rows.length === 0){
            return res.status(404).json({ message: "Provider not found" });
        }

        const providerId = providerResult.rows[0].id;
        const deleteResult = await db.query(
            `DELETE FROM time_slots
            WHERE id = $1 AND provider_id = $2 AND booking_id IS NULL
            RETURNING id`,
            [slotId, providerId]
        );

        if(!deleteResult.rows || deleteResult.rows.length === 0){
            return res.status(404).json({ message: "Busy slot not found or cannot be deleted" });
        }

        return res.json({ success: true, deletedSlotId: deleteResult.rows[0].id });
    }
    catch(err){
        next(err);
    }
};
