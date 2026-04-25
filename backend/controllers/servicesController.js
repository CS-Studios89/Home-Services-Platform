const db = require('../config/db');

exports.getServices = async (req, res, next) => {
    try {

        const servicesResult = await db.query(
            'SELECT s.id, s.name, MIN(o.rate) minrate FROM services s, offerings o WHERE o.service_id = s.id GROUP BY s.id'
        );

        const newServicesResult = await db.query(
            `SELECT s.id, s.name FROM services s where s.id not in (select o.service_id from offerings o)`
        );

        let services = [];
        servicesResult.rows.forEach(e => {
            services.push({service_id: e.id, name: e.name, minRate: e.minrate});
        });
        newServicesResult.rows.forEach(e => {
            services.push({service_id: e.id, name: e.name, minRate: 'N/A'});
        })

        return res.json(services);
    } catch (err) {
        next(err);
    }
}




