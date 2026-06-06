const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/perf/history/:hostId - 获取主机 24 小时性能历史
router.get('/perf/history/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;
    const { type } = req.query; // cpu / memory / disk / network

    const [rows] = await pool.query(
      `SELECT metric_type, metric_name, metric_value, extra_info, collected_at
       FROM perf_history
       WHERE host_id = ? AND collected_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
       ORDER BY collected_at ASC`,
      [hostId]
    );

    // 按 metric_type 分组
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.metric_type]) grouped[row.metric_type] = [];
      grouped[row.metric_type].push(row);
    });

    // 转换为 ECharts 折线图格式
    const result = {};

    // CPU
    if (grouped.cpu) {
      result.cpu = formatLineSeries(grouped.cpu, ['user', 'system', 'idle', 'iowait']);
    }

    // Memory
    if (grouped.memory) {
      result.memory = formatMemorySeries(grouped.memory);
    }

    // Disk
    if (grouped.disk) {
      result.disk = formatDiskSeries(grouped.disk);
    }

    // Network
    if (grouped.network) {
      result.network = formatNetworkSeries(grouped.network);
    }

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: result
    });
  } catch (err) {
    console.error('Perf history error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

/**
 * 通用折线图格式化：按 metric_name 分 series，X 轴为时间
 */
function formatLineSeries(rows, metricNames) {
  // 收集所有时间点
  const timeSet = new Set();
  rows.forEach(r => timeSet.add(formatTime(r.collected_at)));
  const times = Array.from(timeSet).sort();

  // 按 metric_name 分组
  const byName = {};
  rows.forEach(r => {
    if (!byName[r.metric_name]) byName[r.metric_name] = {};
    byName[r.metric_name][formatTime(r.collected_at)] = r.metric_value;
  });

  // 构建 series
  const series = metricNames
    .filter(name => byName[name])
    .map(name => ({
      name,
      type: 'line',
      smooth: true,
      data: times.map(t => byName[name][t] ?? null)
    }));

  return { times, series };
}

/**
 * 内存：计算使用率百分比
 */
function formatMemorySeries(rows) {
  const timeSet = new Set();
  rows.forEach(r => timeSet.add(formatTime(r.collected_at)));
  const times = Array.from(timeSet).sort();

  const byName = {};
  rows.forEach(r => {
    if (!byName[r.metric_name]) byName[r.metric_name] = {};
    byName[r.metric_name][formatTime(r.collected_at)] = r.metric_value;
  });

  const series = [];

  // Physical memory usage %
  if (byName.memUsed && byName.memTotal) {
    series.push({
      name: 'Physical',
      type: 'line',
      smooth: true,
      data: times.map(t => {
        const used = byName.memUsed[t];
        const total = byName.memTotal[t];
        return (total > 0) ? parseFloat(((used / total) * 100).toFixed(1)) : null;
      })
    });
  }

  // Swap usage %
  if (byName.swapUsed && byName.swapTotal) {
    series.push({
      name: 'PageSpace',
      type: 'line',
      smooth: true,
      data: times.map(t => {
        const used = byName.swapUsed[t];
        const total = byName.swapTotal[t];
        return (total > 0) ? parseFloat(((used / total) * 100).toFixed(1)) : null;
      })
    });
  }

  return { times, series };
}

/**
 * 磁盘：按 extra_info (mount) 分 series
 */
function formatDiskSeries(rows) {
  const timeSet = new Set();
  rows.forEach(r => timeSet.add(formatTime(r.collected_at)));
  const times = Array.from(timeSet).sort();

  const byMount = {};
  rows.forEach(r => {
    const mount = r.extra_info || 'unknown';
    if (!byMount[mount]) byMount[mount] = {};
    byMount[mount][formatTime(r.collected_at)] = r.metric_value;
  });

  const series = Object.keys(byMount).map(mount => ({
    name: mount,
    type: 'line',
    smooth: true,
    data: times.map(t => byMount[mount][t] ?? null)
  }));

  return { times, series };
}

/**
 * 网络：按 extra_info (interface) 分 series，收发分开
 */
function formatNetworkSeries(rows) {
  const timeSet = new Set();
  rows.forEach(r => timeSet.add(formatTime(r.collected_at)));
  const times = Array.from(timeSet).sort();

  const byIfaceMetric = {};
  rows.forEach(r => {
    const key = `${r.extra_info}_${r.metric_name}`;
    if (!byIfaceMetric[key]) byIfaceMetric[key] = {};
    byIfaceMetric[key][formatTime(r.collected_at)] = r.metric_value;
  });

  const series = Object.keys(byIfaceMetric).map(key => {
    // 计算每两个时间点之间的增量（MB）
    const values = times.map(t => byIfaceMetric[key][t] ?? 0);
    const deltas = values.map((v, i) => {
      if (i === 0) return 0;
      const delta = v - values[i - 1];
      return delta >= 0 ? parseFloat((delta / (1024 * 1024)).toFixed(2)) : 0;
    });

    const [iface, metric] = key.split('_');
    return {
      name: `${iface} ${metric === 'rxBytes' ? 'RX' : 'TX'}`,
      type: 'line',
      smooth: true,
      data: deltas
    };
  });

  return { times, series };
}

function formatTime(date) {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

module.exports = router;
