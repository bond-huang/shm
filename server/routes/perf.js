const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/cpuperf - CPU 性能数据
router.get('/cpuperf', async (req, res) => {
  try {
    const hostId = req.query.hostId || 1;

    const [rows] = await pool.query(
      'SELECT metric_name, hour_0, hour_1, hour_2, hour_3, hour_4, hour_5, hour_6, hour_7, hour_8, hour_9, hour_10, hour_11, hour_12, hour_13, hour_14, hour_15, hour_16, hour_17, hour_18, hour_19, hour_20, hour_21, hour_22, hour_23 FROM cpu_performance WHERE host_id = ? ORDER BY id',
      [hostId]
    );

    const series = rows.map(row => {
      const data = [];
      for (let i = 0; i < 24; i++) {
        data.push(row[`hour_${i}`]);
      }
      return {
        name: row.metric_name,
        type: 'line',
        smooth: true,
        data
      };
    });

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: series
    });
  } catch (err) {
    console.error('CPU perf error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
