const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');
const { pool } = require('../db');

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminCheck = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (adminCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const admin = adminCheck.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// All routes below are protected by adminAuth
router.use(adminAuth);

// GET /users
router.get('/users', async (req, res) => {
  try {
    const users = await pool.query('SELECT id, name, phone, instagram, gender, created_at FROM users ORDER BY created_at DESC');
    res.json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /stats
router.get('/stats', async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
    const pendingEventsCount = await pool.query("SELECT COUNT(*) FROM events WHERE status = 'pending'");
    const recentEvents = await pool.query(
      'SELECT id, name, event_date, event_time, status FROM events ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalEvents: parseInt(eventsCount.rows[0].count),
      pendingEvents: parseInt(pendingEventsCount.rows[0].count),
      recentEvents: recentEvents.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /events
router.get('/events', async (req, res) => {
  try {
    const events = await pool.query(`
      SELECT e.*, (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
      FROM events e ORDER BY created_at DESC
    `);
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /events
router.post('/events', async (req, res) => {
  try {
    const { name, event_date, event_time } = req.body;
    
    if (!name || !event_date) {
      return res.status(400).json({ message: 'Name and event date are required' });
    }

    const time = event_time || '17:00:00';

    const newEvent = await pool.query(
      'INSERT INTO events (name, event_date, event_time) VALUES ($1, $2, $3) RETURNING *',
      [name, event_date, time]
    );

    const eventId = newEvent.rows[0].id;

    // Auto-add all current users
    await pool.query(`
      INSERT INTO event_participants (event_id, user_id)
      SELECT $1, id FROM users
    `, [eventId]);

    res.status(201).json(newEvent.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /events/:id
router.get('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participants = await pool.query(`
      SELECT u.id, u.name, u.phone, u.instagram, u.gender 
      FROM users u
      JOIN event_participants ep ON u.id = ep.user_id
      WHERE ep.event_id = $1
    `, [eventId]);

    const matches = await pool.query('SELECT * FROM matches WHERE event_id = $1', [eventId]);

    res.json({
      event: event.rows[0],
      participants: participants.rows,
      matches: matches.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /events/:id
router.delete('/events/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /events/:id/special-pair
router.post('/events/:id/special-pair', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { maleUserId, femaleUserId } = req.body;

    // Remove any existing special pair for this event
    await pool.query('DELETE FROM matches WHERE event_id = $1 AND is_special_pair = true', [eventId]);

    // Insert new special pair
    await pool.query(
      'INSERT INTO matches (event_id, male_user_id, female_user_id, is_special_pair) VALUES ($1, $2, $3, true)',
      [eventId, maleUserId, femaleUserId]
    );

    await pool.query("UPDATE events SET status = 'shuffled' WHERE id = $1", [eventId]);

    res.json({ message: 'Special pair set successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /events/:id/shuffle
router.post('/events/:id/shuffle', async (req, res) => {
  try {
    const eventId = req.params.id;

    const participants = await pool.query(`
      SELECT u.id, u.gender 
      FROM users u
      JOIN event_participants ep ON u.id = ep.user_id
      WHERE ep.event_id = $1
    `, [eventId]);

    const matchedUsers = await pool.query('SELECT male_user_id, female_user_id FROM matches WHERE event_id = $1', [eventId]);
    const matchedSet = new Set();
    matchedUsers.rows.forEach(m => {
      matchedSet.add(m.male_user_id);
      matchedSet.add(m.female_user_id);
    });

    const males = participants.rows.filter(p => p.gender === 'male' && !matchedSet.has(p.id)).map(p => p.id);
    const females = participants.rows.filter(p => p.gender === 'female' && !matchedSet.has(p.id)).map(p => p.id);

    // Fisher-Yates shuffle
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    shuffleArray(males);
    shuffleArray(females);

    const pairCount = Math.min(males.length, females.length);
    for (let i = 0; i < pairCount; i++) {
      await pool.query(
        'INSERT INTO matches (event_id, male_user_id, female_user_id) VALUES ($1, $2, $3)',
        [eventId, males[i], females[i]]
      );
    }

    await pool.query("UPDATE events SET status = 'shuffled' WHERE id = $1", [eventId]);

    const allMatches = await pool.query('SELECT * FROM matches WHERE event_id = $1', [eventId]);

    res.json({ message: 'Shuffle complete', matches: allMatches.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /events/:id/reveal
router.post('/events/:id/reveal', async (req, res) => {
  try {
    await pool.query("UPDATE events SET status = 'revealed' WHERE id = $1", [req.params.id]);
    res.json({ message: 'Event revealed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /events/:id/matches
router.get('/events/:id/matches', async (req, res) => {
  try {
    const matches = await pool.query(`
      SELECT m.*, 
             mu.name as male_name, mu.phone as male_phone, mu.instagram as male_instagram,
             fu.name as female_name, fu.phone as female_phone, fu.instagram as female_instagram
      FROM matches m
      LEFT JOIN users mu ON m.male_user_id = mu.id
      LEFT JOIN users fu ON m.female_user_id = fu.id
      WHERE m.event_id = $1
    `, [req.params.id]);
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
