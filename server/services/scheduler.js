const pool = require('../config/db');
const { collectLinux } = require('./perfCollector');

const COLLECT_INTERVAL = 10 * 60 * 1000; // 10 分钟采集一次
let timer = null;

/**
 * 采集所有已配置 SSH 凭据的主机性能数据并存入 perf_history
 */
async function collectAll() {
  try {
    const [hosts] = await pool.query(
      "SELECT id, ip_address, host_type, ssh_user, ssh_password FROM hosts WHERE ssh_user IS NOT NULL AND ssh_user != '' AND ssh_password IS NOT NULL AND ssh_password != ''"
    );

    if (hosts.length === 0) return;

    const now = new Date();
    const promises = hosts.map(host => collectHost(host, now));
    await Promise.allSettled(promises);

    // 清理 24 小时前的旧数据
    await pool.query('DELETE FROM perf_history WHERE collected_at < DATE_SUB(NOW(), INTERVAL 1 DAY)');

    console.log(`[Scheduler] Collected ${hosts.length} hosts at ${now.toISOString()}`);
  } catch (err) {
    console.error('[Scheduler] Error:', err.message);
  }
}

async function collectHost(host, now) {
  try {
    if (host.host_type !== 'Linux') return;

    const data = await collectLinux(host.ip_address, 22, host.ssh_user, host.ssh_password);
    const rows = [];

    // CPU
    if (data.cpu) {
      rows.push([host.id, 'cpu', 'user', data.cpu.user, null, now]);
      rows.push([host.id, 'cpu', 'system', data.cpu.system, null, now]);
      rows.push([host.id, 'cpu', 'idle', data.cpu.idle, null, now]);
      rows.push([host.id, 'cpu', 'iowait', data.cpu.iowait, null, now]);
    }

    // Memory
    if (data.memory) {
      rows.push([host.id, 'memory', 'memUsed', data.memory.used, null, now]);
      rows.push([host.id, 'memory', 'memTotal', data.memory.total, null, now]);
      rows.push([host.id, 'memory', 'swapUsed', data.memory.swapUsed, null, now]);
      rows.push([host.id, 'memory', 'swapTotal', data.memory.swapTotal, null, now]);
    }

    // Disk
    if (data.disk) {
      data.disk.forEach(d => {
        rows.push([host.id, 'disk', 'usePercent', d.usePercent, d.mount, now]);
      });
    }

    // Network
    if (data.network) {
      data.network.forEach(n => {
        rows.push([host.id, 'network', 'rxBytes', n.rxBytes, n.interface, now]);
        rows.push([host.id, 'network', 'txBytes', n.txBytes, n.interface, now]);
      });
    }

    if (rows.length > 0) {
      await pool.query(
        'INSERT INTO perf_history (host_id, metric_type, metric_name, metric_value, extra_info, collected_at) VALUES ?',
        [rows]
      );
    }
  } catch (err) {
    console.error(`[Scheduler] Host ${host.ip_address} failed:`, err.message);
  }
}

/**
 * 启动定时采集
 */
function start() {
  if (timer) return;
  console.log('[Scheduler] Starting perf collection every 10 min');
  // 启动后先采集一次
  collectAll();
  timer = setInterval(collectAll, COLLECT_INTERVAL);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[Scheduler] Stopped');
  }
}

module.exports = { start, stop, collectAll };
