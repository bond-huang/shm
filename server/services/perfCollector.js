const { execCommand } = require('./sshService');

/**
 * 采集 Linux 主机实时性能数据
 * @param {string} host - IP
 * @param {number} port - SSH 端口
 * @param {string} user - 用户名
 * @param {string} password - 密码
 * @returns {Promise<object>} 性能数据
 */
async function collectLinux(host, port, user, password) {
  // 并发执行所有采集命令
  const [cpuRaw, memRaw, diskRaw, netRaw, loadRaw, uptimeRaw, hostnameRaw, osRaw, kernelRaw, archRaw, coresRaw, selinuxRaw] = await Promise.all([
    execCommand(host, port, user, password, 'top -bn1 | head -5'),
    execCommand(host, port, user, password, 'free -m'),
    execCommand(host, port, user, password, 'df -B1 --total 2>/dev/null || df -h'),
    execCommand(host, port, user, password, 'cat /proc/net/dev'),
    execCommand(host, port, user, password, 'cat /proc/loadavg'),
    execCommand(host, port, user, password, 'uptime -p 2>/dev/null || uptime'),
    execCommand(host, port, user, password, 'hostname'),
    execCommand(host, port, user, password, 'cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d \\"'),
    execCommand(host, port, user, password, 'uname -r'),
    execCommand(host, port, user, password, 'uname -m'),
    execCommand(host, port, user, password, 'nproc'),
    execCommand(host, port, user, password, 'getenforce 2>/dev/null || echo N/A')
  ]);

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
 * %Cpu(s):  5.3 us,  2.1 sy,  0.0 ni, 91.8 id,  0.8 wa,  0.0 hi,  0.0 si,  0.0 st
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
 *               total        used        free      shared  buff/cache   available
 * Mem:           7864        4523        1204         256        2137        2852
 * Swap:          2048           0        2048
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

  // 提取 available 和 buff/cache
  let available = mem.free;
  let buffers = 0;
  if (memLine) {
    const parts = memLine.trim().split(/\s+/);
    // free -m: total used free shared buff/cache available
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
 * 解析 df 输出（带 --total 的 B1 单位或 -h 人类可读）
 * Filesystem     1B-blocks        Used   Available Use% Mounted on
 * /dev/sda1      53687091200  24696061952 26214400000  49% /
 */
function parseDisk(raw) {
  const lines = raw.trim().split('\n').slice(1); // 跳过表头
  const disks = [];

  for (const line of lines) {
    if (!line.trim() || line.includes('total')) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) continue;

    const filesystem = parts[0];
    const mount = parts[parts.length - 1]; // 最后一列是挂载点
    const usePercentStr = parts[parts.length - 2];
    const usePercent = parseInt(usePercentStr) || 0;
    const availStr = parts[parts.length - 3];
    const usedStr = parts[parts.length - 4];
    const sizeStr = parts[1];

    // 如果是字节单位，转换为 GB
    const toGB = (val) => {
      const n = parseInt(val);
      if (isNaN(n)) return val;
      return (n / (1024 * 1024 * 1024)).toFixed(1) + 'G';
    };

    // 判断是否为字节单位（数字大于 1000000）
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
 * Inter-|   Receive                                                |  Transmit
 *  face |bytes    packets errs drop fifo frame compressed multicast|bytes ...
 *  eth0: 1234567    8900    0    0    0     0          0         0  987654 ...
 */
function parseNetwork(raw) {
  const lines = raw.trim().split('\n').slice(2); // 跳过前两行表头
  const interfaces = [];

  for (const line of lines) {
    const parts = line.trim().split(/[\s:]+/);
    if (parts.length < 17) continue;

    const name = parts[0];
    if (name === 'lo') continue; // 跳过 loopback

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
 * 0.85 0.62 0.45 2/312 12345
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
