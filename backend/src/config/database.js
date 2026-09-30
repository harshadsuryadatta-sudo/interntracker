const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
let isInMemory = false;

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('mock') && !databaseUrl.includes('placeholder')) {
    try {
      console.log('[DB] Attempting connection to PostgreSQL database...');
      const ssl = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false };

      const candidatePool = new Pool({
        connectionString: databaseUrl,
        ssl: ssl,
        connectionTimeoutMillis: 5000,
      });

      const client = await candidatePool.connect();
      await client.query('SELECT 1');
      client.release();

      pool = candidatePool;
      console.log('[DB] Successfully connected to live PostgreSQL database.');
      return pool;
    } catch (err) {
      console.warn(`[DB] Live PostgreSQL connection failed (${err.message}). Falling back to PostgreSQL-compliant in-memory engine...`);
    }
  } else {
    console.log('[DB] No DATABASE_URL specified. Initializing embedded PostgreSQL instance for local development...');
  }

  // Fallback to pg-mem
  const { newDb, DataType } = require('pg-mem');
  const memDb = newDb({
    autoCreateForeignKeyIndices: true,
  });

  memDb.public.registerFunction({
    name: 'current_database',
    implementation: () => 'intern_tracker_mem',
  });

  const toCharImpl = (val, fmt) => {
    if (!val) return null;
    const d = new Date(val);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    if (fmt === 'YYYY-MM') return `${y}-${m}`;
    if (fmt === 'YYYY-MM-DD') return `${y}-${m}-${day}`;
    return `${y}-${m}`;
  };

  memDb.public.registerFunction({
    name: 'to_char',
    args: [DataType.date, DataType.text],
    returns: DataType.text,
    implementation: toCharImpl,
  });
  memDb.public.registerFunction({
    name: 'to_char',
    args: [DataType.timestamp, DataType.text],
    returns: DataType.text,
    implementation: toCharImpl,
  });
  memDb.public.registerFunction({
    name: 'to_char',
    args: [DataType.timestamptz, DataType.text],
    returns: DataType.text,
    implementation: toCharImpl,
  });

  const adapter = memDb.adapters.createPg();
  pool = new adapter.Pool();
  isInMemory = true;
  console.log('[DB] Embedded PostgreSQL engine successfully initialized.');
  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

module.exports = {
  initDatabase,
  getPool,
  query,
  getIsInMemory: () => isInMemory,
};

