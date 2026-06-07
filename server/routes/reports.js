const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { SCRIPT_NAME, INSPECTION_SCRIPT, runInspection } = require('../services/inspection');
const { generateReport } = require('../services/reportGenerator');

const router = express.Router();
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

// 确保 reports 目录存在
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// GET /api/reports/script - 获取巡检脚本内容
router.get('/reports/script', (req, res) => {
  res.json({
    statusCode: '200',
    statusMessage: 'success',
    data: { name: SCRIPT_NAME, script: INSPECTION_SCRIPT }
  });
});

// POST /api/reports/generate/:hostId - 执行巡检并生成报告
router.post('/reports/generate/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;

    // 查询主机信息
    const [rows] = await pool.query(
      'SELECT id, host_name, ip_address, host_type, ssh_user, ssh_password FROM hosts WHERE id = ?',
      [hostId]
    );

    if (rows.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Host not found' });
    }

    const host = rows[0];

    if (!host.ssh_user || !host.ssh_password) {
      return res.json({ statusCode: '400', statusMessage: 'SSH credentials not configured' });
    }

    if (host.host_type !== 'Linux') {
      return res.json({ statusCode: '400', statusMessage: 'Only Linux hosts are supported' });
    }

    // 执行巡检
    const data = await runInspection(host.ip_address, 22, host.ssh_user, host.ssh_password);

    // 生成报告
    const html = generateReport(data, { ip: host.ip_address });

    // 创建目录: reports/{hostname}_{ip}/
    const hostname = data.systemInfo.hostname || host.host_name;
    const dirName = `${hostname}_${host.ip_address.replace(/\./g, '_')}`;
    const reportDir = path.join(REPORTS_DIR, dirName);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 文件名: {hostname}_{IP}_{YYYYMMDD_HHmmss}.html
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
    const fileName = `${hostname}_${host.ip_address}_${ts}.html`;
    const filePath = path.join(reportDir, fileName);

    fs.writeFileSync(filePath, html, 'utf-8');

    res.json({
      statusCode: '200',
      statusMessage: 'Report generated successfully',
      data: { fileName, dirName, path: filePath }
    });
  } catch (err) {
    console.error('Generate report error:', err.message);
    res.json({ statusCode: '500', statusMessage: `Generation failed: ${err.message}` });
  }
});

// GET /api/reports/list/:hostId - 获取指定主机的报告列表
router.get('/reports/list/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;

    const [rows] = await pool.query(
      'SELECT host_name, ip_address FROM hosts WHERE id = ?',
      [hostId]
    );

    if (rows.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Host not found' });
    }

    const host = rows[0];
    const dirName = `${host.host_name}_${host.ip_address.replace(/\./g, '_')}`;
    const reportDir = path.join(REPORTS_DIR, dirName);

    if (!fs.existsSync(reportDir)) {
      return res.json({ statusCode: '200', statusMessage: 'success', data: [] });
    }

    const files = fs.readdirSync(reportDir)
      .filter(f => f.endsWith('.html'))
      .sort()
      .reverse()
      .map(f => {
        const stat = fs.statSync(path.join(reportDir, f));
        // 从文件名提取日期: hostname_YYYYMMDD_HHmmss.html
        const match = f.match(/(\d{8})_(\d{6})\.html$/);
        let date = '';
        if (match) {
          const d = match[1];
          const t = match[2];
          date = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)} ${t.slice(0,2)}:${t.slice(2,4)}:${t.slice(4,6)}`;
        } else {
          date = stat.mtime.toISOString().slice(0, 19).replace('T', ' ');
        }
        return { name: f, date, dirName };
      });

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: files
    });
  } catch (err) {
    console.error('List reports error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// GET /api/reports/view/:hostId/:filename - 查看报告
router.get('/reports/view/:hostId/:filename', async (req, res) => {
  try {
    const { hostId, filename } = req.params;
    const filePath = await getReportPath(hostId, filename);
    if (!filePath) return res.status(404).send('Report not found');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// GET /api/reports/download/:hostId/:filename - 下载报告
router.get('/reports/download/:hostId/:filename', async (req, res) => {
  try {
    const { hostId, filename } = req.params;
    const filePath = await getReportPath(hostId, filename);
    if (!filePath) return res.status(404).send('Report not found');
    res.download(filePath, filename);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// DELETE /api/reports/:hostId/:filename - 删除报告
router.delete('/reports/:hostId/:filename', async (req, res) => {
  try {
    const { hostId, filename } = req.params;
    const filePath = await getReportPath(hostId, filename);
    if (!filePath) return res.json({ statusCode: '404', statusMessage: 'Report not found' });

    fs.unlinkSync(filePath);
    res.json({ statusCode: '200', statusMessage: 'Report deleted', data: null });
  } catch (err) {
    console.error('Delete report error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

/**
 * 根据 hostId 和 filename 获取报告完整路径
 */
async function getReportPath(hostId, filename) {
  const [rows] = await pool.query(
    'SELECT host_name, ip_address FROM hosts WHERE id = ?',
    [hostId]
  );
  if (rows.length === 0) return null;

  const host = rows[0];
  const dirName = `${host.host_name}_${host.ip_address.replace(/\./g, '_')}`;
  const filePath = path.join(REPORTS_DIR, dirName, filename);

  if (!fs.existsSync(filePath)) return null;
  return filePath;
}

module.exports = router;
