const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, instagram, gender, password } = req.body;
    
    if (!name || !phone || !gender || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, phone, instagram, gender, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, instagram, gender, created_at',
      [name, phone, instagram, gender, hash]
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Please enter phone and password' });
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userCheck.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, name: user.name, gender: user.gender },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    delete user.password_hash;

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
