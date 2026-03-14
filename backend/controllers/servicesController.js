const db = require('../config/db');

exports.getServices = async (req, res, next) => {
    try {

        const servicesResult = await db.query(
            'SELECT s.id, s.name, MIN(o.rate) minrate FROM services s, offerings o WHERE o.service_id = s.id GROUP BY s.id'
        );

        let services = [];
        servicesResult.rows.forEach(e => {
            services.push({service_id: e.id, name: e.name, minRate: e.minrate});
        });

        return res.json(services);
    } catch (err) {
        next(err);
    }
}




