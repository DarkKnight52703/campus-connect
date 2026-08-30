const express = require('express');
const router = express.Router();

// GET /ping — lightweight health check for uptime monitors (UptimeRobot, cron-job.org)
// Point your uptime pinger at: https://campus-connect-server-voxa.onrender.com/ping
router.get('/', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

module.exports = router;
