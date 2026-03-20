require('dotenv').config();
const { Client } = require('pg');

const db = require("../config/db");
// const tables = require("../data/tables");
const tables = require("../data/tables002");

// const seeds = require("../data/seed");
const seeds = require("../data/seed003");

exports.dropDatabase = async function () {
    const client = new Client({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
        database: 'postgres' // must NOT connect to the DB we want to drop
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL!');

        const dbName = process.env.PG_DB;

        // Terminate all active connections to the database
        await client.query(`
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = $1
              AND pid <> pg_backend_pid();
        `, [dbName]);

        console.log(`Closed active connections to "${dbName}"`);

        // Drop database
        await client.query(`DROP DATABASE IF EXISTS ${dbName};`);
        console.log(`Database "${dbName}" dropped successfully!`);

        // List remaining databases
        // const res = await client.query('SELECT datname FROM pg_database;');
        // console.log('Databases:');
        // res.rows.forEach(row => console.log(`- ${row.datname}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
};

exports.createDatabase = async function () {
    // Connect to default postgres database first
    const client = new Client({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
        database: 'postgres' // default database
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL!');

        // Create the database
        const createDbQuery = `CREATE DATABASE ${process.env.PG_DB};`;
        await client.query(createDbQuery);
        console.log(`Database "${process.env.PG_DB}" created successfully!`);

        // List all databases
        const res = await client.query('SELECT datname FROM pg_database;');
        console.log('Databases:');
        res.rows.forEach(row => console.log(`- ${row.datname}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

exports.createTables = async () => {
    for(let i = 0; i < tables.tablesToCreate.length; i++){
        await db.query(tables.tablesToCreate[i]);
    }
}

exports.insertData = async () => {
    for(let i = 0; i < seeds.dataToInsert.length; i++){
        await db.query(seeds.dataToInsert[i]);
    }
}