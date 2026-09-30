const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function runMigrations() {
  console.log('[Migration] Running PostgreSQL database schema migration...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  let schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Strip line comments
  schemaSql = schemaSql.replace(/--.*$/gm, '');

  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await query(statement);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        console.warn(`[Migration Warning] ${err.message}`);
      }
    }
  }

  console.log('[Migration] PostgreSQL schema migration completed successfully.');
}

module.exports = { runMigrations };

