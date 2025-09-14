const { Pool } = require('pg');

const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'maga123',
    password: '12345',
    database: 'db_urlshortener'
});

module.exports = pool;