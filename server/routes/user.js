const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');

// GET /profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, phone, instagram, gender, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /my-match
router.get('/my-match', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the latest event this user is participating in
    const eventQuery = await pool.query(
      `SELECT e.* FROM events e 
       JOIN event_participants ep ON e.id = ep.event_id 
       WHERE ep.user_id = $1 
       ORDER BY e.created_at DESC LIMIT 1`,
      [userId]
    );

    if (eventQuery.rows.length === 0) {
      return res.json({ matched: false });
    }

    const event = eventQuery.rows[0];

    if (event.status === 'pending') {
      return res.json({ matched: false });
    }

    if (event.status === 'shuffled') {
      // Compute reveal time: event_time - 5 minutes
      const eventDateStr = event.event_date.toISOString().split('T')[0];
      const revealTime = new Date(`${eventDateStr}T${event.event_time}`);
      revealTime.setMinutes(revealTime.getMinutes() - 5);
      return res.json({ matched: false, isRevealed: false, pending: true, revealTime: revealTime });
    }

    // Event is 'revealed'
    const matchQuery = await pool.query(
      `SELECT * FROM matches 
       WHERE event_id = $1 AND (male_user_id = $2 OR female_user_id = $2)`,
      [event.id, userId]
    );

    if (matchQuery.rows.length === 0) {
      // User is in the event but wasn't matched (odd one out)
      return res.json({ matched: false, isRevealed: true, eventName: event.name, unmatched: true });
    }

    const match = matchQuery.rows[0];
    const partnerId = match.male_user_id === userId ? match.female_user_id : match.male_user_id;

    const partnerQuery = await pool.query(
      'SELECT name, phone, instagram FROM users WHERE id = $1',
      [partnerId]
    );

    res.json({
      matched: true,
      isRevealed: true,
      eventName: event.name,
      isSpecialPair: match.is_special_pair,
      partner: partnerQuery.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /my-history
router.get('/my-history', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all events the user participated in (revealed only, ordered newest first)
    const eventsQuery = await pool.query(
      `SELECT e.id, e.name, e.event_date, e.event_time, e.status
       FROM events e
       JOIN event_participants ep ON e.id = ep.event_id
       WHERE ep.user_id = $1 AND e.status = 'revealed'
       ORDER BY e.event_date DESC`,
      [userId]
    );

    const history = await Promise.all(eventsQuery.rows.map(async (event) => {
      const matchQuery = await pool.query(
        `SELECT * FROM matches WHERE event_id = $1 AND (male_user_id = $2 OR female_user_id = $2)`,
        [event.id, userId]
      );

      if (matchQuery.rows.length === 0) {
        return { event, matched: false, unmatched: true };
      }

      const match = matchQuery.rows[0];
      const partnerId = match.male_user_id === userId ? match.female_user_id : match.male_user_id;

      const partnerQuery = await pool.query(
        'SELECT name, phone, instagram FROM users WHERE id = $1',
        [partnerId]
      );

      return {
        event,
        matched: true,
        isSpecialPair: match.is_special_pair,
        partner: partnerQuery.rows[0],
      };
    }));

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
