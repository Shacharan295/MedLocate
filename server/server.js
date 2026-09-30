require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { initCronJobs } = require('./services/cronService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // Check if database needs initial seeding
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server Startup] Database is empty. Seeding initial demo data...');
      const { seedData } = require('./scripts/seed');
      await seedData({ clearExisting: false });
    }

    // 2. Initialize reservation expiry cron workers
    initCronJobs();

    // 3. Start Express HTTP server
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` MedLocate Backend Server Running on Port ${PORT}`);
      console.log(` API Base URL: http://localhost:${PORT}/api`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
