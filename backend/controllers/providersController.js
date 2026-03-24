const db = require('../config/db');

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