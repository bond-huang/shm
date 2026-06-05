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
      `SELECT id as HostId, host_type as HostType, host_name as HostName,
       ip_address as IPadd, status as StatusInfo, category as Category,
       business_name as BusinessName, data_center as DataCenter
       FROM hosts ORDER BY id LIMIT ? OFFSET ?`,
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
    const { HostType, HostName, IPadd, StatusInfo, Category, BusinessName, DataCenter } = req.body;

    if (!HostType || !HostName || !IPadd) {
      return res.json({
        statusCode: '400',
        statusMessage: 'HostType, HostName and IP Address are required'
      });
    }

    const [existing] = await pool.query('SELECT id FROM hosts WHERE ip_address = ?', [IPadd]);
    if (existing.length > 0) {
      return res.json({
        statusCode: '400',
        statusMessage: 'IP Address already exists'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO hosts (host_type, host_name, ip_address, status, category, business_name, data_center)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [HostType, HostName, IPadd, StatusInfo || 'Health', Category || '', BusinessName || '', DataCenter || '']
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
    const { HostType, HostName, IPadd, StatusInfo, Category, BusinessName, DataCenter } = req.body;

    if (!HostType || !HostName || !IPadd) {
      return res.json({
        statusCode: '400',
        statusMessage: 'HostType, HostName and IP Address are required'
      });
    }

    const [existing] = await pool.query('SELECT id FROM hosts WHERE ip_address = ? AND id != ?', [IPadd, id]);
    if (existing.length > 0) {
      return res.json({
        statusCode: '400',
        statusMessage: 'IP Address already exists'
      });
    }

    await pool.query(
      `UPDATE hosts SET host_type = ?, host_name = ?, ip_address = ?, status = ?,
       category = ?, business_name = ?, data_center = ? WHERE id = ?`,
      [HostType, HostName, IPadd, StatusInfo || 'Health', Category || '', BusinessName || '', DataCenter || '', id]
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

// GET /api/categories - 获取分类统计
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT category, COUNT(*) as count,
       SUM(CASE WHEN status = 'Health' THEN 1 ELSE 0 END) as health_count,
       SUM(CASE WHEN status = 'Warning' THEN 1 ELSE 0 END) as warning_count,
       SUM(CASE WHEN status = 'Severe' THEN 1 ELSE 0 END) as severe_count
       FROM hosts WHERE category != '' GROUP BY category ORDER BY count DESC`
    );

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: rows
    });
  } catch (err) {
    console.error('Categories error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// GET /api/categories/:name/hosts - 获取指定分类的主机列表
router.get('/categories/:name/hosts', async (req, res) => {
  try {
    const { name } = req.params;

    const [rows] = await pool.query(
      `SELECT id as HostId, host_type as HostType, host_name as HostName,
       ip_address as IPadd, status as StatusInfo, category as Category,
       business_name as BusinessName, data_center as DataCenter
       FROM hosts WHERE category = ? ORDER BY id`,
      [name]
    );

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: rows
    });
  } catch (err) {
    console.error('Category hosts error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
