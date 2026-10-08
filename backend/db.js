// Connexion à la base PostgreSQL, utilisée par server.js
const { Pool } = require('pg');

module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
