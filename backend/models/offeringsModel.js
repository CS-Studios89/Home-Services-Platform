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

exports.fetchFilteredOffers = async (filters) => {
    let dbQuery = `
      SELECT u.name uname, s.name sname, a.country, a.city, o.id oid, o.title, o.rate, o.curr  
        FROM services s, offerings o, providers p, addresses a, users u
        WHERE o.service_id = s.id AND o.provider_id = p.id AND 
        p.addr_id = a.id AND p.user_id = u.id AND o.active = true
        AND u.role = 'provider'
    `;
    
    const { query, values } = buildFilters(filters, dbQuery);

    const offeringsResult = await db.query(query, values);

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

    // return ["hello World"];
    return offers;
};

// Helper to build SQL dynamically
function buildFilters(filters, query) {
    const values = [];
    let idx = 1;

    if(filters.filters){
        filters = filters.filters;
    }


    // Job filter
    if (filters.job) {
        if (!Array.isArray(filters.job)) {
            filters.job = [filters.job];
        }
        const jobs = filters.job.filter(j => j != null);
        if (jobs.length) {
            const placeholders = jobs.map(() => `$${idx++}`).join(', ');
            query += ` AND LOWER(s.name) IN (${placeholders})`;
            values.push(...jobs.map(j => j.toLowerCase()));
        }
    }

    // Rate filter
    if (filters.rate) {
        const min = Number(filters.rate.min);
        const max = Number(filters.rate.max);
      
        if (Number.isFinite(min)) {
          query += ` AND o.rate >= $${idx++}`;
          values.push(min);
        }
      
        if (Number.isFinite(max)) {
          query += ` AND o.rate <= $${idx++}`;
          values.push(max);
        }
      }
      

    // Country filter
    if (filters.country) {
        query += ` AND LOWER(a.country) = $${idx++}`;
        values.push(filters.country.toLowerCase());
    }

    // Cities filter
    if (filters.cities) {
        const cities = Array.isArray(filters.cities)
          ? filters.cities
          : [filters.cities];
        const cleanCities = cities.filter(c => c != null);
        if (cleanCities.length) {
            const placeholders = cleanCities.map(() => `$${idx++}`).join(', ');
            query += ` AND LOWER(a.city) IN (${placeholders})`;
            values.push(...cleanCities.map(c => c.toLowerCase()));
        }
    }

    return { query, values };
}