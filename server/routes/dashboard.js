const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/statistics - 主机状态统计
router.get('/statistics', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT status, COUNT(*) as count FROM hosts GROUP BY status'
    );

    const stats = {
      allHosts: 0,
      healthHosts: 0,
      warningHosts: 0,
      severeHosts: 0
    };

    rows.forEach(row => {
      stats.allHosts += row.count;
      if (row.status === 'Health') stats.healthHosts = row.count;
      if (row.status === 'Warning') stats.warningHosts = row.count;
      if (row.status === 'Severe') stats.severeHosts = row.count;
    });

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: stats
    });
  } catch (err) {
    console.error('Statistics error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
