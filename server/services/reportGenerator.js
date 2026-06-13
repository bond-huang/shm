/**
 * 生成巡检 HTML 报告（支持 Linux 和 AIX）
 */
function generateReport(data, hostInfo) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const si = data.systemInfo;
  const cpu = data.cpu;
  const mem = data.memory;
  const memUsedPct = mem.total > 0 ? Math.round((mem.used / mem.total) * 100) : 0;
  const swapUsedPct = mem.swapTotal > 0 ? Math.round((mem.swapUsed / mem.swapTotal) * 100) : 0;

  // 判断系统类型
  const isAIX = hostInfo.hostType === 'AIX';
  const osType = isAIX ? 'AIX' : 'Linux';

  // CPU 状态分析
  const cpuUsage = (cpu.user + cpu.system + cpu.iowait).toFixed(1);
  const cpuState = cpuUsage > 80 ? 'Warning! CPU usage is high.' : 'Normal. CPU usage is normal.';
  const cpuIdleState = cpu.idle < 20 ? 'Warning! CPU idle is low.' : 'Normal. CPU idle is normal.';

  // 内存状态分析
  const memState = memUsedPct > 90 ? 'Warning! Memory is almost exhausted.' :
    memUsedPct > 70 ? 'Attention. Memory usage is high.' : 'Normal. Memory usage is normal.';

  // 磁盘状态分析
  const over80Disks = data.disks.filter(d => parseInt(d.usePercent) > 80);
  const fsCheck = over80Disks.length > 0
    ? `Warning! Found ${over80Disks.length} filesystem(s) over 80%: ${over80Disks.map(d => d.mount).join(', ')}`
    : 'No filesystem used over 80% was found.';

  // 错误日志分析
  const errorCheck = data.errors && data.errors.length > 10
    ? `<pre style="background:#fff3cd;padding:10px;border-radius:4px;font-size:12px;max-height:300px;overflow:auto;">${escapeHtml(data.errors)}</pre>`
    : `<p>No critical errors found in system ${isAIX ? 'error log (errpt)' : 'logs (journalctl)'}.`;

  // AIX 额外信息
  const aixExtraRows = isAIX ? `
    <tr><td class="info-label">LPAR</td><td>${escapeHtml(si.lpar || 'N/A')}</td></tr>
    <tr><td class="info-label">IO Stats</td><td>${escapeHtml(si.ioStats || 'N/A')}</td></tr>
    <tr><td class="info-label">System Config</td><td>${escapeHtml(si.config || 'N/A')}</td></tr>
    <tr><td class="info-label">Paging Space</td><td>${escapeHtml(si.pagingSpace || 'N/A')}</td></tr>
  ` : `
    <tr><td class="info-label">SELinux</td><td>${escapeHtml(si.selinux)}</td></tr>
    <tr><td class="info-label">Firewall</td><td>${escapeHtml(si.firewall)}</td></tr>
  `;

  // CPU 表格 - AIX 可能没有详细 CPU 数据
  const cpuTableRows = isAIX
    ? `<tr><td colspan="5" style="text-align:center;color:#666;">AIX CPU usage details are available via vmstat output in system config section.</td></tr>`
    : `<tr><td>User</td><td>${cpu.user}</td><td>-</td></tr>
    <tr><td>System</td><td>${cpu.system}</td><td>-</td></tr>
    <tr><td>IOWait</td><td>${cpu.iowait}</td><td class="${cpu.iowait > 10 ? 'warning' : 'normal'}">${cpu.iowait > 10 ? 'Warning! IOWait is high.' : 'Normal.'}</td></tr>
    <tr><td>Total Usage</td><td>${cpuUsage}</td><td class="${cpuUsage > 80 ? 'warning' : 'normal'}">${cpuState}</td></tr>
    <tr><td>Idle</td><td>${cpu.idle.toFixed(1)}</td><td class="${cpu.idle < 20 ? 'warning' : 'normal'}">${cpuIdleState}</td></tr>`;

  // CPU 表格头
  const cpuTableHeader = isAIX
    ? `<tr><th>Item</th><th>Note</th></tr>`
    : `<tr><th>Item</th><th>Value(%)</th><th>State Analysis</th></tr>`;

  // Load Average 显示
  const loadAvgStr = typeof si.loadAvg === 'object'
    ? `1min: ${si.loadAvg['1min']}, 5min: ${si.loadAvg['5min']}, 15min: ${si.loadAvg['15min']}`
    : escapeHtml(si.loadAvg);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${osType} Health Check Report - ${escapeHtml(si.hostname)}</title>
  <style>
    body { margin: 0 auto; max-width: 900px; font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; color: #333; padding: 20px; }
    h1 { font-size: 24px; text-align: center; color: #1a73e8; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    h2 { font-size: 18px; color: #1a73e8; border-left: 4px solid #1a73e8; padding-left: 10px; margin-top: 30px; }
    h3 { font-size: 14px; color: #555; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; font-size: 13px; }
    th { background: #e8f0fe; color: #1a73e8; font-weight: 600; }
    tr:nth-child(even) { background: #f8f9fa; }
    .info-label { font-weight: 600; width: 180px; background: #f1f3f4; }
    .normal { color: #28a745; } .warning { color: #dc3545; }
    .header-meta { text-align: center; color: #666; font-size: 13px; margin-bottom: 20px; }
    pre { background: #f1f3f4; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${osType} System Health Check Report</h1>
  <div class="header-meta">
    <p>Host: <b>${escapeHtml(si.hostname)}</b> (${escapeHtml(hostInfo.ip)}) | Type: ${osType} | Date: ${dateStr} ${timeStr}</p>
  </div>

  <h2>System Information</h2>
  <table>
    <tr><td class="info-label">OS Version</td><td>${escapeHtml(si.osVersion)}</td></tr>
    <tr><td class="info-label">Kernel</td><td>${escapeHtml(si.kernel)}</td></tr>
    <tr><td class="info-label">Architecture</td><td>${escapeHtml(si.architecture)}</td></tr>
    <tr><td class="info-label">Hostname</td><td>${escapeHtml(si.hostname)}</td></tr>
    <tr><td class="info-label">IP Address</td><td>${escapeHtml(hostInfo.ip)}</td></tr>
    <tr><td class="info-label">CPU Cores</td><td>${si.cpuCores || 'N/A'}</td></tr>
    <tr><td class="info-label">Memory</td><td>${mem.total > 0 ? mem.total + ' MB' : 'N/A'}</td></tr>
    <tr><td class="info-label">Swap</td><td>${mem.swapTotal > 0 ? mem.swapTotal + ' MB' : 'N/A'}</td></tr>
    <tr><td class="info-label">Uptime</td><td>${escapeHtml(si.uptime)}</td></tr>
    <tr><td class="info-label">Load Average</td><td>${loadAvgStr}</td></tr>
    ${aixExtraRows}
  </table>

  <h2>CPU Performance</h2>
  <table>
    ${cpuTableHeader}
    ${cpuTableRows}
  </table>

  <h2>Memory Performance</h2>
  <table>
    <tr><th>Item</th><th>Total(MB)</th><th>Used(MB)</th><th>Free(MB)</th><th>Used(%)</th><th>State Analysis</th></tr>
    <tr><td>Physical Memory</td><td>${mem.total}</td><td>${mem.used}</td><td>${mem.free}</td><td>${memUsedPct}%</td><td class="${memUsedPct > 90 ? 'warning' : 'normal'}">${memState}</td></tr>
    ${mem.swapTotal > 0 ? `<tr><td>Swap</td><td>${mem.swapTotal}</td><td>${mem.swapUsed}</td><td>${mem.swapTotal - mem.swapUsed}</td><td>${swapUsedPct}%</td><td class="${swapUsedPct > 50 ? 'warning' : 'normal'}">${swapUsedPct > 50 ? 'Warning! Swap usage is high.' : 'Normal.'}</td></tr>` : ''}
  </table>

  <h2>Disk Performance</h2>
  <table>
    <tr><th>Filesystem</th><th>Size</th><th>Used</th><th>Available</th><th>Use%</th><th>Mount</th><th>State</th></tr>
    ${data.disks.map(d => {
      const pct = parseInt(d.usePercent);
      const cls = pct > 90 ? 'warning' : pct > 80 ? 'warning' : 'normal';
      const state = pct > 90 ? 'Critical!' : pct > 80 ? 'Warning!' : 'Normal';
      return `<tr><td>${escapeHtml(d.filesystem)}</td><td>${d.size}</td><td>${d.used}</td><td>${d.avail}</td><td>${d.usePercent}</td><td>${escapeHtml(d.mount)}</td><td class="${cls}">${state}</td></tr>`;
    }).join('\n    ')}
  </table>
  <p><b>Filesystem Check:</b> <span class="${over80Disks.length > 0 ? 'warning' : 'normal'}">${fsCheck}</span></p>

  <h2>System Error Log</h2>
  ${errorCheck}

  <h2>Top Processes (by Memory)</h2>
  <table>
    <tr><th>User</th><th>PID</th><th>CPU%</th><th>MEM%</th><th>Command</th></tr>
    ${data.processes.map(p => `<tr><td>${escapeHtml(p.user)}</td><td>${p.pid}</td><td>${p.cpu}</td><td>${p.mem}</td><td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(p.command)}</td></tr>`).join('\n    ')}
  </table>

  <h2>System Reboot History</h2>
  <pre>${escapeHtml(data.reboot)}</pre>

  <hr style="margin-top:30px;">
  <p style="text-align:center;color:#999;font-size:12px;">Generated by SHM System Health Management | ${dateStr} ${timeStr}</p>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = { generateReport };
