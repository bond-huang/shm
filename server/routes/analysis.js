const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const pool = require('../config/db');

const router = express.Router();

// 文件上传配置
const uploadDir = path.join(__dirname, '..', 'uploads', 'analysis');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/analysis/run — 上传 CSV + Python 脚本并执行分析
router.post('/analysis/run', upload.fields([
  { name: 'csv', maxCount: 1 },
  { name: 'script', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description } = req.body;
    const csvFile = req.files?.csv?.[0];
    const scriptFile = req.files?.script?.[0];

    if (!csvFile || !scriptFile) {
      return res.json({ statusCode: '400', statusMessage: 'Both CSV and Python script are required' });
    }

    // 创建分析记录
    const [result] = await pool.query(
      `INSERT INTO analyses (name, description, csv_filename, script_filename, status)
       VALUES (?, ?, ?, ?, 'running')`,
      [name || 'Analysis', description || '', csvFile.originalname, scriptFile.originalname]
    );
    const analysisId = result.insertId;

    // 执行 Python 脚本
    const csvPath = csvFile.path;
    const scriptPath = scriptFile.path;
    const resultPath = path.join(uploadDir, `result_${analysisId}.html`);

    // 确保 Python 能找到 openpyxl 等依赖
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    execFile(pythonCmd, [scriptPath, csvPath, resultPath], {
      timeout: 60000,
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    }, async (err, stdout, stderr) => {
      let html = '';
      let status = 'completed';
      let errorMsg = '';

      if (err) {
        status = 'failed';
        errorMsg = stderr || err.message;
        console.error('Analysis error:', errorMsg);
      } else {
        // 优先读取生成的 HTML 文件
        if (fs.existsSync(resultPath)) {
          try {
            html = fs.readFileSync(resultPath, 'utf-8');
          } catch (e) {
            html = stdout || '';
          }
        } else {
          // 如果脚本直接输出 HTML 到 stdout
          html = stdout || '';
        }

        // 如果输出看起来像 HTML，直接使用
        if (html && !html.trim().startsWith('<')) {
          // 输出不是 HTML，包装一下
          html = `<pre style="white-space: pre-wrap;">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        }
      }

      // 更新数据库
      await pool.query(
        'UPDATE analyses SET result_html = ?, status = ?, error_msg = ? WHERE id = ?',
        [html, status, errorMsg, analysisId]
      );

      // 清理临时文件（保留结果文件用于调试）
      try { fs.unlinkSync(csvPath); } catch (e) {}
      try { fs.unlinkSync(scriptPath); } catch (e) {}

      res.json({
        statusCode: status === 'completed' ? '200' : '500',
        statusMessage: status === 'completed' ? 'Analysis completed' : `Analysis failed: ${errorMsg}`,
        data: { id: analysisId, status, html, error: errorMsg }
      });
    });
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.json({ statusCode: '500', statusMessage: `Server error: ${err.message}` });
  }
});

// POST /api/analysis/run-builtin — 使用内置脚本分析
router.post('/analysis/run-builtin', upload.single('csv'), async (req, res) => {
  try {
    const { name, script_name } = req.body;
    const csvFile = req.file;

    if (!csvFile) {
      return res.json({ statusCode: '400', statusMessage: 'CSV file is required' });
    }

    // 内置脚本映射
    const builtinScripts = {
      'SVC-IOGRP-Perf.py': path.join(__dirname, '..', 'scripts', 'SVC-IOGRP-Perf.py')
    };

    const scriptPath = builtinScripts[script_name];
    if (!scriptPath || !fs.existsSync(scriptPath)) {
      return res.json({ statusCode: '400', statusMessage: `Built-in script not found: ${script_name}` });
    }

    // 创建分析记录
    const [result] = await pool.query(
      `INSERT INTO analyses (name, csv_filename, script_filename, status) VALUES (?, ?, ?, 'running')`,
      [name || 'Analysis', csvFile.originalname, script_name]
    );
    const analysisId = result.insertId;

    const csvPath = csvFile.path;
    const resultPath = path.join(uploadDir, `result_${analysisId}.html`);
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    execFile(pythonCmd, [scriptPath, csvPath, resultPath], {
      timeout: 60000,
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    }, async (err, stdout, stderr) => {
      let html = '';
      let status = 'completed';
      let errorMsg = '';

      if (err) {
        status = 'failed';
        errorMsg = stderr || err.message;
      } else {
        if (fs.existsSync(resultPath)) {
          try { html = fs.readFileSync(resultPath, 'utf-8'); } catch (e) { html = stdout || ''; }
        } else {
          html = stdout || '';
        }
        if (html && !html.trim().startsWith('<')) {
          html = `<pre style="white-space: pre-wrap;">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
        }
      }

      await pool.query('UPDATE analyses SET result_html = ?, status = ?, error_msg = ? WHERE id = ?', [html, status, errorMsg, analysisId]);

      try { fs.unlinkSync(csvPath); } catch (e) {}

      res.json({
        statusCode: status === 'completed' ? '200' : '500',
        statusMessage: status === 'completed' ? 'Analysis completed' : `Analysis failed: ${errorMsg}`,
        data: { id: analysisId, status, html, error: errorMsg }
      });
    });
  } catch (err) {
    console.error('Builtin analysis error:', err.message);
    res.json({ statusCode: '500', statusMessage: `Server error: ${err.message}` });
  }
});

// GET /api/analysis/list — 获取分析记录列表
router.get('/analysis/list', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, csv_filename, script_filename, status, error_msg, created_at FROM analyses ORDER BY created_at DESC'
    );
    res.json({ statusCode: '200', statusMessage: 'success', data: rows });
  } catch (err) {
    console.error('List analyses error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// GET /api/analysis/:id — 获取单条分析结果
router.get('/analysis/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM analyses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Not found' });
    }
    res.json({ statusCode: '200', statusMessage: 'success', data: rows[0] });
  } catch (err) {
    console.error('Get analysis error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// DELETE /api/analysis/:id — 删除分析记录
router.delete('/analysis/:id', async (req, res) => {
  try {
    // 清理结果文件
    const resultPath = path.join(uploadDir, `result_${req.params.id}.html`);
    try { fs.unlinkSync(resultPath); } catch (e) {}

    await pool.query('DELETE FROM analyses WHERE id = ?', [req.params.id]);
    res.json({ statusCode: '200', statusMessage: 'Deleted', data: null });
  } catch (err) {
    console.error('Delete analysis error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
