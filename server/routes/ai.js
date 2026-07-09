const express = require('express');
const pool = require('../config/db');
const { chatCompletionStream } = require('../services/aiService');

const router = express.Router();

// ==================== 模型配置管理 ====================

// GET /api/ai/configs - 获取所有模型配置
router.get('/ai/configs', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, model_name, api_base_url, model_id, is_default, status, created_at, updated_at FROM ai_configs ORDER BY is_default DESC, id ASC'
    );
    // 不返回 api_key 给前端
    res.json({ statusCode: '200', statusMessage: 'success', data: rows });
  } catch (err) {
    console.error('Get AI configs error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// POST /api/ai/configs - 新增模型配置
router.post('/ai/configs', async (req, res) => {
  try {
    const { model_name, api_base_url, api_key, model_id } = req.body;
    if (!model_name || !api_base_url || !api_key || !model_id) {
      return res.json({ statusCode: '400', statusMessage: 'All fields are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO ai_configs (model_name, api_base_url, api_key, model_id) VALUES (?, ?, ?, ?)',
      [model_name, api_base_url.replace(/\/+$/, ''), api_key, model_id]
    );
    res.json({ statusCode: '200', statusMessage: 'Config added', data: { id: result.insertId } });
  } catch (err) {
    console.error('Add AI config error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// PUT /api/ai/configs/:id - 更新模型配置
router.put('/ai/configs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { model_name, api_base_url, api_key, model_id, is_default, status } = req.body;

    const fields = [];
    const params = [];

    if (model_name !== undefined) { fields.push('model_name = ?'); params.push(model_name); }
    if (api_base_url !== undefined) { fields.push('api_base_url = ?'); params.push(api_base_url.replace(/\/+$/, '')); }
    if (api_key !== undefined && api_key !== '') { fields.push('api_key = ?'); params.push(api_key); }
    if (model_id !== undefined) { fields.push('model_id = ?'); params.push(model_id); }
    if (is_default !== undefined) {
      if (is_default) {
        await pool.query('UPDATE ai_configs SET is_default = 0');
      }
      fields.push('is_default = ?'); params.push(is_default ? 1 : 0);
    }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }

    if (fields.length === 0) {
      return res.json({ statusCode: '400', statusMessage: 'No fields to update' });
    }

    params.push(id);
    await pool.query(`UPDATE ai_configs SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ statusCode: '200', statusMessage: 'Config updated' });
  } catch (err) {
    console.error('Update AI config error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// DELETE /api/ai/configs/:id - 删除模型配置
router.delete('/ai/configs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ai_configs WHERE id = ?', [req.params.id]);
    res.json({ statusCode: '200', statusMessage: 'Config deleted' });
  } catch (err) {
    console.error('Delete AI config error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// ==================== 对话会话管理 ====================

// GET /api/ai/sessions - 获取当前用户的对话列表
router.get('/ai/sessions', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ statusCode: '401', statusMessage: 'Unauthorized' });
    }
    const [rows] = await pool.query(
      `SELECT s.id, s.title, s.model_config_id, s.created_at, s.updated_at,
              c.model_name as model_name
       FROM chat_sessions s
       LEFT JOIN ai_configs c ON s.model_config_id = c.id
       WHERE s.user_id = ?
       ORDER BY s.updated_at DESC`,
      [userId]
    );
    res.json({ statusCode: '200', statusMessage: 'success', data: rows });
  } catch (err) {
    console.error('Get sessions error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// POST /api/ai/sessions - 新建对话
router.post('/ai/sessions', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ statusCode: '401', statusMessage: 'Unauthorized' });
    }
    const { title, model_config_id } = req.body;

    // 如果没指定模型，使用默认模型
    let configId = model_config_id;
    if (!configId) {
      const [defaultConfig] = await pool.query('SELECT id FROM ai_configs WHERE is_default = 1 AND status = 1 LIMIT 1');
      configId = defaultConfig.length > 0 ? defaultConfig[0].id : null;
    }

    const [result] = await pool.query(
      'INSERT INTO chat_sessions (user_id, title, model_config_id) VALUES (?, ?, ?)',
      [userId, title || 'New Chat', configId]
    );
    res.json({ statusCode: '200', statusMessage: 'Session created', data: { id: result.insertId } });
  } catch (err) {
    console.error('Create session error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// DELETE /api/ai/sessions/:id - 删除对话
router.delete('/ai/sessions/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    await pool.query('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    res.json({ statusCode: '200', statusMessage: 'Session deleted' });
  } catch (err) {
    console.error('Delete session error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// ==================== 消息管理 ====================

// GET /api/ai/sessions/:id/messages - 获取对话消息
router.get('/ai/sessions/:id/messages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json({ statusCode: '200', statusMessage: 'success', data: rows });
  } catch (err) {
    console.error('Get messages error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// ==================== AI 聊天（SSE 流式） ====================

// POST /api/ai/chat - 发送消息并流式获取回复
router.post('/ai/chat', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ statusCode: '401', statusMessage: 'Unauthorized' });
    }

    const { session_id, content, model_config_id } = req.body;
    if (!session_id || !content) {
      return res.json({ statusCode: '400', statusMessage: 'session_id and content are required' });
    }

    // 验证会话属于当前用户
    const [sessions] = await pool.query(
      'SELECT id, model_config_id FROM chat_sessions WHERE id = ? AND user_id = ?',
      [session_id, userId]
    );
    if (sessions.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Session not found' });
    }

    // 获取模型配置
    const configId = model_config_id || sessions[0].model_config_id;
    const [configs] = await pool.query(
      'SELECT id, api_base_url, api_key, model_id FROM ai_configs WHERE id = ? AND status = 1',
      [configId]
    );
    if (configs.length === 0 || !configs[0].api_key) {
      return res.json({ statusCode: '400', statusMessage: 'Model not configured or API key missing' });
    }
    const config = configs[0];

    // 保存用户消息
    await pool.query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)',
      [session_id, 'user', content]
    );

    // 获取历史消息（最近 20 条）
    const [history] = await pool.query(
      'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [session_id]
    );

    // 构建消息数组
    const messages = [
      { role: 'system', content: 'You are a helpful assistant for IT operations and system management. You can help with server administration, troubleshooting, scripting, and monitoring. Respond in the same language as the user.' },
      ...history.map(m => ({ role: m.role, content: m.content }))
    ];

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    // 流式调用 AI
    let fullContent = '';
    try {
      await chatCompletionStream(config, messages, (chunk) => {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      });
    } catch (aiErr) {
      res.write(`data: ${JSON.stringify({ error: aiErr.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // 保存 AI 回复
    if (fullContent) {
      await pool.query(
        'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)',
        [session_id, 'assistant', fullContent]
      );

      // 自动更新会话标题（用第一条用户消息的前 30 个字符）
      const [msgCount] = await pool.query(
        'SELECT COUNT(*) as cnt FROM chat_messages WHERE session_id = ? AND role = ?',
        [session_id, 'user']
      );
      if (msgCount[0].cnt === 1) {
        const title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        await pool.query('UPDATE chat_sessions SET title = ? WHERE id = ?', [title, session_id]);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) {
      res.json({ statusCode: '500', statusMessage: 'Server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

module.exports = router;
