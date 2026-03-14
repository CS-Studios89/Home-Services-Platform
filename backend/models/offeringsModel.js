const db = require('../config/db');

exports.fetchOffers = async () => {
    const offeringsResult = await db.query(
        `SELECT u.name uname, s.name sname, a.country, a.city, o.id oid, o.title, o.rate, o.curr  
        FROM services s, offerings o, providers p, addresses a, users u
        WHERE o.service_id = s.id AND o.provider_id = p.id AND 
        p.addr_id = a.id AND p.user_id = u.id AND o.active = true`
    );

    let offers = [];
    offeringsResult.rows.forEach(e => {
        offers.push({
            offerId: e.oid,
            providerName: e.uname, 
            serviceName: e.sname, 
            providerCountry: e.country,
            providerCity: e.city,
            offerTitle: e.title,
            hourlyRate: e.rate,
            currency: e.curr
        });
    });

    return offers;
}