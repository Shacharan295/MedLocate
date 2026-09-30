const cron = require('node-cron');
const { expireStaleReservations } = require('./reservationService');

const initCronJobs = () => {
  // Check for expired reservations every 60 seconds
  cron.schedule('* * * * *', async () => {
    try {
      await expireStaleReservations();
    } catch (err) {
      console.error('[Cron Job Error] Failed to expire stale reservations:', err);
    }
  });

  console.log('[Cron Service] Background expiry worker scheduled (runs every 60s).');
};

module.exports = { initCronJobs };
