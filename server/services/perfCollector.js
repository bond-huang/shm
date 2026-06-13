const { execCommands } = require('./sshService');

/**
 * 采集 AIX 主机实时性能数据
 */
async function collectAIX(host, port, user, password) {
  const cmds = [
    'prtconf 2>/dev/null',                                           // 0 - Machine Type, Serial, Memory, etc.
    'uname -Mu 2>/dev/null',                                         // 1 - Machine Type, Serial
    'oslevel -s 2>/dev/null || oslevel 2>/dev/null',                // 2 - AIX Level
    'lparstat 1 2 2>/dev/null | tail -2',                           // 3 - CPU Entitled Capacity
    'lsps -a 2>/dev/null',                                           // 4 - Page Space
    'svmon -G -O unit=MB 2>/dev/null || vmstat -v',                 // 5 - Memory
    'df -g',                                                         // 6 - Disk
    'hostname',                                                      // 7 - Hostname
    'uptime',                                                        // 8 - Load avg
    'netstat -i 2>/dev/null',                                        // 9 - Network
    'ps -ef 2>/dev/null | head -11 || ps aux 2>/dev/null | head -11' // 10 - Top processes
  ];

  const results = await execCommands(host, port, user, password, cmds);

  const [
    prtconfRaw, unameRaw, oslevelRaw, lparstatRaw, lspsRaw,
    memRaw, diskRaw, hostnameRaw, loadRaw, netRaw, topProcRaw
  ] = results;

  // Parse prtconf line by line
  let machineType = '', serialNumber = '', platformFirmware = '', memSize = '', fwVersion = '';

  const prtLines = prtconfRaw.split('\n');
  for (const line of prtLines) {
    const trimmed = line.trim();
    if (trimmed.match(/^System\s*Model:/i)) machineType = trimmed.split(':').slice(1).join(':').trim();
    if (trimmed.match(/^Machine\s*Serial\s*Number:/i)) serialNumber = trimmed.split(':').slice(1).join(':').trim();
    if (trimmed.match(/^Platform\s*Firmware\s*level:/i)) platformFirmware = trimmed.split(':').slice(1).join(':').trim();
    if (trimmed.match(/^Firmware\s*Version:/i)) fwVersion = trimmed.split(':').slice(1).join(':').trim();
    if (trimmed.match(/^Memory\s*Size:/i)) memSize = trimmed.split(':').slice(1).join(':').trim();
  }

  // Platform Firmware = Platform Firmware level or Firmware Version
  if (platformFirmware === 'Not Available' && fwVersion) platformFirmware = fwVersion;

  // Parse uname -Mu as fallback
  // Real AIX: IBM,03119874A,00F60396C000,VMM,7.0,0,0
  // QEMU:    IBM pSeries (emulated by qemu) IBM pSeries (emulated by qemu)
  if (machineType === 'Not Available' || !machineType) {
    const unameParts = unameRaw.trim().split(',');
    if (unameParts.length >= 2 && unameParts[0].includes(',')) {
      // Real AIX format
      machineType = unameParts[0].trim();
      if (unameParts.length >= 3) serialNumber = unameParts[2].trim();
    }
  }

  // Parse oslevel -s (格式: 7200-03-01-1838), qemu 可能不支持
  let aixLevel = oslevelRaw.trim().split('\n')[0].trim();
  // 如果 oslevel -s 失败，尝试其他方式
  if (!aixLevel) {
    // 尝试从 prtconf 的 Processor Version 推断
    const procMatch = prtconfRaw.match(/Processor\s*Version:\s*(.+)/i);
    if (procMatch) aixLevel = procMatch[1].trim();
  }

  // Parse lparstat for CPU Entitled Capacity
  let cpuEntitled = '';
  const lparLines = lparstatRaw.trim().split('\n');
  if (lparLines.length >= 2) {
    const parts = lparLines[lparLines.length - 1].trim().split(/\s+/);
    if (parts.length >= 4) {
      cpuEntitled = parts[2] || ''; // Entitled Capacity column
    }
  }

  // Parse lsps for Page Space Size and usage
  // lsps -a 输出格式: Name VG PV LP PPs Size Vmused Free %Used Jfs
  //                    rootvg hdisk0 001 512 512 4096mb 52mb 4044mb 2% /jfs2
  let pageSpaceSize = '';
  let pageSpaceUsed = 0;
  const lspsLines = lspsRaw.trim().split('\n');
  // 找到表头确定列位置
  const headerLine = lspsLines.find(l => l.includes('PPs') || l.includes('Size'));
  if (headerLine) {
    const headerParts = headerLine.trim().split(/\s+/);
    const sizeIdx = headerParts.findIndex(h => h.match(/size/i));
    const usedIdx = headerParts.findIndex(h => h.match(/%used/i));
    // 从第二行开始是数据
    for (let i = 1; i < lspsLines.length; i++) {
      const line = lspsLines[i];
      if (!line.trim() || line.includes('---')) continue;
      const parts = line.trim().split(/\s+/);
      if (sizeIdx >= 0 && parts.length > sizeIdx) {
        pageSpaceSize += parts[sizeIdx] + ' ';
      } else if (parts.length >= 5) {
        // 默认取第5列 (Size)
        pageSpaceSize += parts[4] + ' ';
      }
      // 获取使用率
      if (usedIdx >= 0 && parts.length > usedIdx) {
        const usedStr = parts[usedIdx].replace('%', '');
        const used = parseInt(usedStr) || 0;
        if (used > pageSpaceUsed) pageSpaceUsed = used;
      }
    }
  }
  pageSpaceSize = pageSpaceSize.trim() || 'N/A';

  // Parse memory from svmon
  let memTotal = 0, memUsed = 0, memFree = 0;
  const memLines = memRaw.trim().split('\n');
  for (const line of memLines) {
    if (line.includes('unit') || line.includes('------') || line.trim() === '') continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 4 && parts[0] !== 'total' && !isNaN(parseInt(parts[1]))) {
      memTotal += parseInt(parts[1]) || 0;
      memUsed += parseInt(parts[2]) || 0;
    }
  }
  if (memTotal > 0) memFree = memTotal - memUsed;

  // Parse disk from df -g
  // AIX df -g 输出格式:
  // Filesystem    GB blocks      Free %Used    Iused %Iused Mounted on
  // /dev/hd4           1.00      0.79   21%     2609     2% /
  const diskLines = diskRaw.trim().split('\n');
  const disks = diskLines.filter(l => l.trim() && l.startsWith('/dev/')).map(l => {
    const parts = l.trim().split(/\s+/);
    if (parts.length < 6) return null;
    // AIX df -g: filesystem size free pctUsed iused iPctUsed mount
    const sizeGB = parseFloat(parts[1]) || 0;
    const freeGB = parseFloat(parts[2]) || 0;
    const usedGB = sizeGB - freeGB;
    const usePercent = parseInt(parts[3].replace('%', '')) || 0;
    return {
      filesystem: parts[0],
      size: parts[1] + 'G',
      used: usedGB.toFixed(2) + 'G',
      avail: parts[2] + 'G',
      usePercent: usePercent,
      mount: parts[6]
    };
  }).filter(Boolean);

  // Parse network (AIX netstat -i: Name Mtu Network Address Ipkts Ierrs Opkts Oerrs Coll)
  const netLines = netRaw.trim().split('\n');
  const interfaces = netLines.filter(l => l.trim() && !l.startsWith('Name')).map(l => {
    const parts = l.trim().split(/\s+/);
    if (parts.length < 9) return null;
    const name = parts[0];
    if (name === 'lo0' || !name) return null;
    // 跳过 link# 行，只取 IP 地址行
    if (parts[2].includes('link')) return null;
    return {
      interface: name,
      rxBytes: 0,
      rxPackets: parseInt(parts[4]) || 0,
      txBytes: 0,
      txPackets: parseInt(parts[6]) || 0
    };
  }).filter(Boolean);

  // Parse load average
  const loadMatch = loadRaw.match(/load average:\s*([\d.]+)\s*([\d.]+)\s*([\d.]+)/);
  const loadAvg = {
    '1min': loadMatch ? parseFloat(loadMatch[1]) : 0,
    '5min': loadMatch ? parseFloat(loadMatch[2]) : 0,
    '15min': loadMatch ? parseFloat(loadMatch[3]) : 0
  };

  // Parse top processes (AIX ps -ef format: UID PID PPID C STIME TTY TIME CMD)
  const procLines = topProcRaw.trim().split('\n').slice(1);
  const processes = procLines.filter(l => l.trim()).map(l => {
    const parts = l.trim().split(/\s+/);
    if (parts.length < 8) return null;
    return { user: parts[0], pid: parts[1], cpu: '-', mem: '-', command: parts.slice(7).join(' ') };
  }).filter(Boolean);

  return {
    cpu: { user: 0, system: 0, idle: 100, iowait: 0 },
    memory: {
      total: memTotal,
      used: memUsed,
      free: memFree,
      buffers: 0,
      available: memFree,
      swapTotal: 0,
      swapUsed: 0,
      usagePercent: memTotal > 0 ? Math.round((memUsed / memTotal) * 100) : 0
    },
    pageSpace: {
      usedPercent: pageSpaceUsed
    },
    disk: disks,
    network: interfaces,
    loadAvg: loadAvg,
    uptime: loadRaw.trim(),
    hostname: hostnameRaw.trim(),
    systemInfo: {
      osVersion: aixLevel || 'AIX',
      kernel: aixLevel,
      architecture: 'PPC',
      cpuCores: 0,
      memTotal: memTotal,
      swapTotal: 0,
      selinux: 'N/A',
      // AIX 特有字段
      machineType: machineType,
      serialNumber: serialNumber,
      platformFirmware: platformFirmware,
      aixLevel: aixLevel,
      cpuEntitled: cpuEntitled,
      memorySize: memSize || (memTotal > 0 ? memTotal + ' MB' : ''),
      pageSpaceSize: pageSpaceSize
    }
  };
}

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

module.exports = { collectLinux, collectAIX };
