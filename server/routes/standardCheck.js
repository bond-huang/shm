const express = require('express');
const pool = require('../config/db');
const { execCommands } = require('../services/sshService');

const router = express.Router();

// GET /api/standard-check/:hostId - 获取主机关联的脚本列表
router.get('/standard-check/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;
    const [rows] = await pool.query(
      `SELECT hs.id, hs.description, hs.created_at,
              s.id as script_id, s.name, s.run_system, s.script_type,
              s.description as readme, s.script_content, s.filename
       FROM host_scripts hs
       JOIN scripts s ON hs.script_id = s.id
       WHERE hs.host_id = ?
       ORDER BY hs.created_at DESC`,
      [hostId]
    );
    res.json({ statusCode: '200', statusMessage: 'success', data: rows });
  } catch (err) {
    console.error('Get host scripts error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// POST /api/standard-check/:hostId - 从 Script Library 添加脚本
router.post('/standard-check/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;
    const { script_id, description } = req.body;

    if (!script_id) {
      return res.json({ statusCode: '400', statusMessage: 'script_id is required' });
    }

    // 检查是否已关联
    const [existing] = await pool.query(
      'SELECT id FROM host_scripts WHERE host_id = ? AND script_id = ?',
      [hostId, script_id]
    );
    if (existing.length > 0) {
      return res.json({ statusCode: '400', statusMessage: 'Script already added to this host' });
    }

    const [result] = await pool.query(
      'INSERT INTO host_scripts (host_id, script_id, description) VALUES (?, ?, ?)',
      [hostId, script_id, description || '']
    );

    res.json({ statusCode: '200', statusMessage: 'Script added', data: { id: result.insertId } });
  } catch (err) {
    console.error('Add host script error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// DELETE /api/standard-check/:hostId/:scriptId - 删除关联
router.delete('/standard-check/:hostId/:scriptId', async (req, res) => {
  try {
    const { hostId, scriptId } = req.params;
    await pool.query('DELETE FROM host_scripts WHERE host_id = ? AND script_id = ?', [hostId, scriptId]);
    res.json({ statusCode: '200', statusMessage: 'Script removed', data: null });
  } catch (err) {
    console.error('Delete host script error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// POST /api/standard-check/:hostId/:scriptId/run - 执行脚本
router.post('/standard-check/:hostId/:scriptId/run', async (req, res) => {
  try {
    const { hostId, scriptId } = req.params;

    // 获取主机信息
    const [hosts] = await pool.query(
      'SELECT id, host_name, ip_address, host_type, ssh_user, ssh_password FROM hosts WHERE id = ?',
      [hostId]
    );
    if (hosts.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Host not found' });
    }
    const host = hosts[0];
    if (!host.ssh_user || !host.ssh_password) {
      return res.json({ statusCode: '400', statusMessage: 'SSH credentials not configured' });
    }

    // 获取脚本内容
    const [scripts] = await pool.query('SELECT script_content, name FROM scripts WHERE id = ?', [scriptId]);
    if (scripts.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Script not found' });
    }
    const script = scripts[0];
    if (!script.script_content) {
      return res.json({ statusCode: '400', statusMessage: 'Script content is empty' });
    }

    // 记录执行开始
    const [historyResult] = await pool.query(
      'INSERT INTO script_run_history (host_id, script_id, run_user, status) VALUES (?, ?, ?, ?)',
      [hostId, scriptId, host.ssh_user, 'running']
    );
    const historyId = historyResult.insertId;

    // 通过 SSH 执行脚本
    try {
      const { execCommand } = require('../services/sshService');
      // 根据 shebang 或主机类型选择 shell
      let shell = 'bash';
      if (script.script_content.startsWith('#!/bin/ksh') || script.script_content.startsWith('#!/usr/bin/ksh')) {
        shell = 'ksh';
      } else if (script.script_content.startsWith('#!/bin/sh') || script.script_content.startsWith('#!/usr/bin/sh')) {
        shell = 'sh';
      }
      // 构建命令：写文件 + 赋权 + 执行 + 删除
      const cmd = `cat > /tmp/_shm_run.sh << 'SCRIPT_EOF'\n${script.script_content}\nSCRIPT_EOF\nchmod +x /tmp/_shm_run.sh\n${shell} /tmp/_shm_run.sh 2>&1\nrm -f /tmp/_shm_run.sh`;
      const output = await execCommand(
        host.ip_address, 22, host.ssh_user, host.ssh_password,
        cmd, 60000
      );
      const success = true;

      await pool.query(
        'UPDATE script_run_history SET end_time = NOW(), status = ?, output = ? WHERE id = ?',
        [success ? 'success' : 'failed', output, historyId]
      );

      res.json({
        statusCode: '200',
        statusMessage: 'success',
        data: { historyId, status: success ? 'success' : 'failed', output, scriptName: script.name }
      });
    } catch (sshErr) {
      await pool.query(
        'UPDATE script_run_history SET end_time = NOW(), status = ?, output = ? WHERE id = ?',
        ['failed', `SSH Error: ${sshErr.message}`, historyId]
      );
      res.json({
        statusCode: '500',
        statusMessage: `Script execution failed: ${sshErr.message}`,
        data: { historyId, status: 'failed', output: `SSH Error: ${sshErr.message}` }
      });
    }
  } catch (err) {
    console.error('Run script error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// GET /api/standard-check/:hostId/:scriptId/history - 查看执行历史
router.get('/standard-check/:hostId/:scriptId/history', async (req, res) => {
  try {
    const { hostId, scriptId } = req.params;
    const [rows] = await pool.query(
      `SELECT id, run_user, start_time, end_time, status, output
       FROM script_run_history
       WHERE host_id = ? AND script_id = ?
       ORDER BY start_time DESC
       LIMIT 50`,
      [hostId, scriptId]
    );
    res.json({ statusCode: '200', statusMessage: 'success', data: rows });
  } catch (err) {
    console.error('Get history error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
