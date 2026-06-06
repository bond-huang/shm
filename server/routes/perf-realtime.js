const express = require('express');
const pool = require('../config/db');
const { collectLinux } = require('../services/perfCollector');

const router = express.Router();

// GET /api/perf/realtime/:hostId - 实时采集主机性能数据
router.get('/perf/realtime/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;

    // 查询主机信息和 SSH 凭据
    const [rows] = await pool.query(
      'SELECT id, host_name, ip_address, host_type, ssh_user, ssh_password FROM hosts WHERE id = ?',
      [hostId]
    );

    if (rows.length === 0) {
      return res.json({
        statusCode: '404',
        statusMessage: 'Host not found',
        data: null
      });
    }

    const host = rows[0];

    if (!host.ssh_user || !host.ssh_password) {
      return res.json({
        statusCode: '400',
        statusMessage: 'SSH credentials not configured for this host',
        data: null
      });
    }

    let perfData;

    if (host.host_type === 'Linux') {
      perfData = await collectLinux(host.ip_address, 22, host.ssh_user, host.ssh_password);
    } else {
      return res.json({
        statusCode: '400',
        statusMessage: `Real-time collection not supported for host type: ${host.host_type}`,
        data: null
      });
    }

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: perfData
    });
  } catch (err) {
    console.error('Realtime perf error:', err.message);
    res.json({
      statusCode: '500',
      statusMessage: `Collection failed: ${err.message}`,
      data: null
    });
  }
});

module.exports = router;
