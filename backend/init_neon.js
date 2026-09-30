const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { initDatabase, query } = require('./src/config/database');
const { runMigrations } = require('./src/database/migrate');
const { seedDatabase } = require('./src/database/seed');

async function main() {
  try {
    console.log('[Neon Init] Connecting to Neon PostgreSQL...');
    await initDatabase();

    console.log('[Neon Init] Running migrations...');
    await runMigrations();

    console.log('[Neon Init] Running seed...');
    await seedDatabase();

    console.log('[Neon Init] Verifying tables in live Neon database...');
    const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('[Neon Tables]:', tables.rows.map(r => r.table_name));

    const users = await query('SELECT name, email, username, role FROM users ORDER BY id');
    console.log(`[Neon Users] Count: ${users.rows.length}`);
    users.rows.forEach(u => console.log(`  - ${u.name} (${u.username}): ${u.email} [${u.role}]`));

    const igAccounts = await query('SELECT account_name, username, followers_count FROM instagram_accounts ORDER BY id');
    console.log(`[Neon Instagram Accounts] Count: ${igAccounts.rows.length}`);
    igAccounts.rows.forEach(a => console.log(`  - ${a.account_name} (@${a.username}): ${a.followers_count} followers`));

    console.log('\n>>> NEON POSTGRESQL INITIALIZATION COMPLETE! <<<');
    process.exit(0);
  } catch (err) {
    console.error('[Neon Init Error]:', err);
    process.exit(1);
  }
}

main();
