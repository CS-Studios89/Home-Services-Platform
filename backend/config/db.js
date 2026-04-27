const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect()
};
