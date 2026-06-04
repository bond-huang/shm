const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/allsystems - 查询主机列表
router.get('/allsystems', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM hosts');
    const total = countResult[0].total;
    const pages = Math.ceil(total / pageSize);

    const [rows] = await pool.query(
      'SELECT id as HostId, host_type as HostType, host_name as HostName, ip_address as IPadd, description as Description, status_info as StatusInfo FROM hosts ORDER BY id LIMIT ? OFFSET ?',
      [pageSize, offset]
    );

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: { total, pages, content: rows }
    });
  } catch (err) {
    console.error('Hosts error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// POST /api/allsystems - 新增主机
router.post('/allsystems', async (req, res) => {
  try {
    const { HostType, HostName, IPadd, Description, StatusInfo } = req.body;

    const [result] = await pool.query(
      'INSERT INTO hosts (host_type, host_name, ip_address, description, status_info) VALUES (?, ?, ?, ?, ?)',
      [HostType, HostName, IPadd, Description || '', StatusInfo || 'Health']
    );

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: { HostId: result.insertId }
    });
  } catch (err) {
    console.error('Add host error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// PUT /api/allsystems/:id - 更新主机
router.put('/allsystems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { HostType, HostName, IPadd, Description, StatusInfo } = req.body;

    await pool.query(
      'UPDATE hosts SET host_type = ?, host_name = ?, ip_address = ?, description = ?, status_info = ? WHERE id = ?',
      [HostType, HostName, IPadd, Description || '', StatusInfo || 'Health', id]
    );

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: null
    });
  } catch (err) {
    console.error('Update host error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// DELETE /api/allsystems/:id - 删除主机
router.delete('/allsystems/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM hosts WHERE id = ?', [id]);

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: null
    });
  } catch (err) {
    console.error('Delete host error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
