const cron = require('node-cron');
const { pool } = require('../db');

const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const pendingEvents = await pool.query("SELECT * FROM events WHERE status != 'revealed'");
      
      const now = new Date();

      for (let event of pendingEvents.rows) {
        // combine date and time
        const eventDateStr = event.event_date.toISOString().split('T')[0];
        const eventDateTime = new Date(`${eventDateStr}T${event.event_time}`);
        
        // subtract 5 minutes
        const revealTime = new Date(eventDateTime.getTime() - 5 * 60000);

        if (now >= revealTime) {
          await pool.query("UPDATE events SET status = 'revealed' WHERE id = $1", [event.id]);
          console.log(`Event ${event.id} auto-revealed.`);
        }
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
  console.log('Cron scheduler started.');
};

module.exports = { startScheduler };
