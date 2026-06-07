const { execCommands } = require('./sshService');

/**
 * 采集 Linux 主机实时性能数据（单连接顺序执行，避免并发连接被拒）
 */
async function collectLinux(host, port, user, password) {
  const cmds = [
    'top -bn1 | head -5',                                                              // 0
    'free -m',                                                                          // 1
    'df -B1 --total 2>/dev/null || df -h',                                              // 2
    'cat /proc/net/dev',                                                                // 3
    'cat /proc/loadavg',                                                                // 4
    'uptime -p 2>/dev/null || uptime',                                                  // 5
    'hostname',                                                                         // 6
    'cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d \\"',    // 7
    'uname -r',                                                                         // 8
    'uname -m',                                                                         // 9
    'nproc',                                                                            // 10
    'getenforce 2>/dev/null || echo N/A'                                                // 11
  ];

  const results = await execCommands(host, port, user, password, cmds);

  const [
    cpuRaw, memRaw, diskRaw, netRaw, loadRaw, uptimeRaw, hostnameRaw,
    osRaw, kernelRaw, archRaw, coresRaw, selinuxRaw
  ] = results;

  const mem = parseMemory(memRaw);

  return {
    cpu: parseCpu(cpuRaw),
    memory: mem,
    disk: parseDisk(diskRaw),
    network: parseNetwork(netRaw),
    loadAvg: parseLoadAvg(loadRaw),
    uptime: uptimeRaw.trim(),
    hostname: hostnameRaw.trim(),
    systemInfo: {
      osVersion: osRaw.trim() || 'Unknown',
      kernel: kernelRaw.trim(),
      architecture: archRaw.trim(),
      cpuCores: parseInt(coresRaw.trim()) || 0,
      memTotal: mem.total,
      swapTotal: mem.swapTotal,
      selinux: selinuxRaw.trim()
    }
  };
}

/**
 * 解析 top 输出中的 CPU 行
 */
function parseCpu(raw) {
  const line = raw.split('\n').find(l => l.includes('%Cpu') || l.includes('Cpu(s)'));
  if (!line) return { user: 0, system: 0, idle: 100, iowait: 0 };

  const get = (label) => {
    const m = line.match(new RegExp(`(\\d+\\.?\\d*)\\s*${label}`));
    return m ? parseFloat(m[1]) : 0;
  };

  return {
    user: get('us'),
    system: get('sy'),
    idle: get('id'),
    iowait: get('wa')
  };
}

/**
 * 解析 free -m 输出
 */
function parseMemory(raw) {
  const lines = raw.split('\n');
  const memLine = lines.find(l => l.startsWith('Mem:'));
  const swapLine = lines.find(l => l.startsWith('Swap:'));

  const parseLine = (line) => {
    if (!line) return { total: 0, used: 0, free: 0 };
    const parts = line.trim().split(/\s+/);
    return {
      total: parseInt(parts[1]) || 0,
      used: parseInt(parts[2]) || 0,
      free: parseInt(parts[3]) || 0
    };
  };

  const mem = parseLine(memLine);
  const swap = parseLine(swapLine);

  let available = mem.free;
  let buffers = 0;
  if (memLine) {
    const parts = memLine.trim().split(/\s+/);
    if (parts.length >= 7) {
      buffers = parseInt(parts[5]) || 0;
      available = parseInt(parts[6]) || mem.free;
    }
  }

  return {
    total: mem.total,
    used: mem.used,
    free: mem.free,
    buffers,
    available,
    swapTotal: swap.total,
    swapUsed: swap.used,
    usagePercent: mem.total > 0 ? Math.round((mem.used / mem.total) * 100) : 0
  };
}

/**
 * 解析 df 输出
 */
function parseDisk(raw) {
  const lines = raw.trim().split('\n').slice(1);
  const disks = [];

  for (const line of lines) {
    if (!line.trim() || line.includes('total')) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) continue;

    const filesystem = parts[0];
    const mount = parts[parts.length - 1];
    const usePercentStr = parts[parts.length - 2];
    const usePercent = parseInt(usePercentStr) || 0;
    const availStr = parts[parts.length - 3];
    const usedStr = parts[parts.length - 4];
    const sizeStr = parts[1];

    const toGB = (val) => {
      const n = parseInt(val);
      if (isNaN(n)) return val;
      return (n / (1024 * 1024 * 1024)).toFixed(1) + 'G';
    };

    const sizeNum = parseInt(sizeStr);
    const isBytes = sizeNum > 1000000;

    disks.push({
      filesystem,
      size: isBytes ? toGB(sizeStr) : parts[1],
      used: isBytes ? toGB(usedStr) : parts[parts.length - 4],
      avail: isBytes ? toGB(availStr) : parts[parts.length - 3],
      usePercent,
      mount
    });
  }

  return disks;
}

/**
 * 解析 /proc/net/dev
 */
function parseNetwork(raw) {
  const lines = raw.trim().split('\n').slice(2);
  const interfaces = [];

  for (const line of lines) {
    const parts = line.trim().split(/[\s:]+/);
    if (parts.length < 17) continue;

    const name = parts[0];
    if (name === 'lo') continue;

    interfaces.push({
      interface: name,
      rxBytes: parseInt(parts[1]) || 0,
      rxPackets: parseInt(parts[2]) || 0,
      txBytes: parseInt(parts[9]) || 0,
      txPackets: parseInt(parts[10]) || 0
    });
  }

  return interfaces;
}

/**
 * 解析 /proc/loadavg
 */
function parseLoadAvg(raw) {
  const parts = raw.trim().split(/\s+/);
  return {
    '1min': parseFloat(parts[0]) || 0,
    '5min': parseFloat(parts[1]) || 0,
    '15min': parseFloat(parts[2]) || 0
  };
}

module.exports = { collectLinux };
