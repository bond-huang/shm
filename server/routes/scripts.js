const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

const router = express.Router();

// 文件上传配置
const uploadDir = path.join(__dirname, '..', 'uploads', 'scripts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/scripts - 查询脚本列表（支持筛选和分页）
router.get('/scripts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search || '';
    const runSystem = req.query.runSystem || '';
    const scriptType = req.query.scriptType || '';
    const offset = (page - 1) * pageSize;

    let where = [];
    let params = [];

    if (search) {
      where.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (runSystem) {
      where.push('run_system = ?');
      params.push(runSystem);
    }
    if (scriptType) {
      where.push('script_type = ?');
      params.push(scriptType);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM scripts ${whereClause}`, params);
    const total = countResult[0].total;
    const pages = Math.ceil(total / pageSize);

    const [rows] = await pool.query(
      `SELECT id, name, run_system, script_type, description, filename, created_at, updated_at
       FROM scripts ${whereClause}
       ORDER BY updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: { total, pages, content: rows }
    });
  } catch (err) {
    console.error('List scripts error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// GET /api/scripts/:id - 获取单个脚本详情（含脚本内容）
router.get('/scripts/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM scripts WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Script not found' });
    }
    res.json({ statusCode: '200', statusMessage: 'success', data: rows[0] });
  } catch (err) {
    console.error('Get script error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// POST /api/scripts - 新增脚本（支持文件上传）
router.post('/scripts', upload.single('file'), async (req, res) => {
  try {
    const { name, introduction, run_system, script_type, description, script_content, description_file } = req.body;

    if (!name || !run_system || !script_type) {
      return res.json({ statusCode: '400', statusMessage: 'Name, System and Type are required' });
    }

    // 检查 name 唯一
    const [existing] = await pool.query('SELECT id FROM scripts WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.json({ statusCode: '400', statusMessage: 'Script name already exists' });
    }

    let content = script_content || '';
    let filename = '';

    // 如果上传了文件，读取内容
    if (req.file) {
      filename = req.file.originalname;
      try {
        content = fs.readFileSync(req.file.path, 'utf-8');
      } catch (e) {
        content = '';
      }
    }

    const [result] = await pool.query(
      `INSERT INTO scripts (name, introduction, run_system, script_type, description, script_content, filename, description_file)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, introduction || '', run_system, script_type, description || '', content, filename, description_file || null]
    );

    res.json({
      statusCode: '200',
      statusMessage: 'Script added',
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error('Add script error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// PUT /api/scripts/:id - 更新脚本
router.put('/scripts/:id', upload.single('file'), async (req, res) => {
  try {
    const { name, introduction, run_system, script_type, description, script_content, description_file } = req.body;
    const { id } = req.params;

    // 检查存在
    const [existing] = await pool.query('SELECT id FROM scripts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Script not found' });
    }

    // 检查 name 唯一（排除自身）
    if (name) {
      const [dup] = await pool.query('SELECT id FROM scripts WHERE name = ? AND id != ?', [name, id]);
      if (dup.length > 0) {
        return res.json({ statusCode: '400', statusMessage: 'Script name already exists' });
      }
    }

    let content = script_content || '';
    let filename = req.body.filename || '';

    if (req.file) {
      filename = req.file.originalname;
      try {
        content = fs.readFileSync(req.file.path, 'utf-8');
      } catch (e) {
        // keep existing content
      }
    }

    await pool.query(
      `UPDATE scripts SET name = ?, introduction = ?, run_system = ?, script_type = ?, description = ?, script_content = ?, filename = ?, description_file = ? WHERE id = ?`,
      [name, introduction || '', run_system, script_type, description || '', content, filename, description_file || null, id]
    );

    res.json({ statusCode: '200', statusMessage: 'Script updated', data: null });
  } catch (err) {
    console.error('Update script error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// DELETE /api/scripts/:id - 删除脚本
router.delete('/scripts/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM scripts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.json({ statusCode: '404', statusMessage: 'Script not found' });
    }

    await pool.query('DELETE FROM scripts WHERE id = ?', [req.params.id]);
    res.json({ statusCode: '200', statusMessage: 'Script deleted', data: null });
  } catch (err) {
    console.error('Delete script error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

// GET /api/scripts/options/filters - 获取筛选下拉选项
router.get('/scripts/options/filters', async (req, res) => {
  try {
    const [systems] = await pool.query('SELECT DISTINCT run_system FROM scripts ORDER BY run_system');
    const [types] = await pool.query('SELECT DISTINCT script_type FROM scripts ORDER BY script_type');
    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: {
        systems: systems.map(s => s.run_system),
        types: types.map(t => t.script_type)
      }
    });
  } catch (err) {
    console.error('Filter options error:', err.message);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
