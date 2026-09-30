const app = require('./app');
const env = require('./config/env');
const { initDatabase } = require('./config/database');
const { runMigrations } = require('./database/migrate');
const { seedDatabase } = require('./database/seed');
const instagramService = require('./services/instagram.service');
const cron = require('node-cron');

async function startServer() {
  try {
    console.log('[Server] Initializing Intern Report Tracker Backend...');

    // 1. Initialize Database
    await initDatabase();

    // 2. Run Database Migrations
    await runMigrations();

    // 3. Seed Demo Data (Admin, Interns, Attendance, Reports, 8 Instagram Accounts)
    await seedDatabase();

    // 4. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Intern Report Tracker Backend API Server is RUNNING`);
      console.log(`📡 URL: http://localhost:${env.PORT}`);
      console.log(`🛡️  Mode: ${env.NODE_ENV}`);
      console.log(`======================================================\n`);
    });

    // 5. Schedule background periodic Instagram synchronization
    // Runs automatically every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('[Cron] Running scheduled automatic Instagram analytics synchronization...');
      try {
        await instagramService.syncAccounts(null);
      } catch (err) {
        console.error('[Cron Error] Instagram sync failed:', err.message);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n[Server] Gracefully shutting down server...');
      server.close(() => {
        console.log('[Server] Closed out remaining connections. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    console.error('[Server Error] Fatal failure during startup:', error);
    process.exit(1);
  }
}

startServer();
