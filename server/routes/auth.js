const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.json({
        statusCode: '403',
        statusMessage: 'Login failed',
        data: { accessToken: '-', refreshToken: '-' }
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        statusCode: '403',
        statusMessage: 'Login failed',
        data: { accessToken: '-', refreshToken: '-' }
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      statusCode: '200',
      statusMessage: 'Successful',
      data: { accessToken, refreshToken }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// POST /api/verify-password - 验证密码
router.post('/verify-password', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.json({
        statusCode: '400',
        statusMessage: 'User not found',
        data: null
      });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);

    if (!isMatch) {
      return res.json({
        statusCode: '400',
        statusMessage: 'Password is incorrect',
        data: null
      });
    }

    res.json({
      statusCode: '200',
      statusMessage: 'Verified',
      data: null
    });
  } catch (err) {
    console.error('Verify password error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
