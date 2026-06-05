const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const router = express.Router();

// GET /api/users - 获取用户列表
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, role, created_at FROM users ORDER BY id'
    );
    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: rows
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// POST /api/users - 添加用户
router.post('/users', async (req, res) => {
  try {
    const { username, password, nickname, role } = req.body;

    if (!username || !password) {
      return res.json({
        statusCode: '400',
        statusMessage: 'Username and password are required'
      });
    }

    // 检查用户名是否已存在
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.json({
        statusCode: '400',
        statusMessage: 'Username already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nickname, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, nickname || username, role || 'user']
    );

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error('Add user error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// PUT /api/users/:id - 更新用户信息
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, role } = req.body;

    await pool.query(
      'UPDATE users SET nickname = ?, role = ? WHERE id = ?',
      [nickname, role || 'user', id]
    );

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: null
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// DELETE /api/users/:id - 删除用户
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 不允许删除自己
    if (req.user && parseInt(id) === req.user.userId) {
      return res.json({
        statusCode: '400',
        statusMessage: 'Cannot delete yourself'
      });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: null
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// PUT /api/users/:id/reset-password - 管理员重置用户密码
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.json({
        statusCode: '400',
        statusMessage: 'New password is required'
      });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.json({
        statusCode: '400',
        statusMessage: 'User not found'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    res.json({
      statusCode: '200',
      statusMessage: 'Password reset successfully',
      data: null
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// PUT /api/password - 用户自己修改密码
router.put('/password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
      return res.json({
        statusCode: '400',
        statusMessage: 'All fields are required'
      });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.json({
        statusCode: '400',
        statusMessage: 'User not found'
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.json({
        statusCode: '400',
        statusMessage: 'Old password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    res.json({
      statusCode: '200',
      statusMessage: 'Password updated successfully',
      data: null
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
