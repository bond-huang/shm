const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/menu
router.get('/menu', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT menu_id, parent_id, menu_type, menu_name, path FROM menus ORDER BY sort_order'
    );

    // 构建树形结构
    const menuMap = {};
    const rootMenus = [];

    rows.forEach(item => {
      menuMap[item.menu_id] = {
        menuId: item.menu_id,
        menuType: item.menu_type,
        menuName: item.menu_name,
        path: item.path || undefined,
        children: []
      };
    });

    rows.forEach(item => {
      if (item.parent_id && menuMap[item.parent_id]) {
        menuMap[item.parent_id].children.push(menuMap[item.menu_id]);
      } else if (!item.parent_id) {
        rootMenus.push(menuMap[item.menu_id]);
      }
    });

    // 清理空的 children 数组
    rootMenus.forEach(menu => {
      if (menu.children.length === 0) {
        delete menu.children;
      }
    });

    res.json({
      statusCode: '200',
      statusMessage: 'success',
      data: rootMenus
    });
  } catch (err) {
    console.error('Menu error:', err);
    res.json({ statusCode: '500', statusMessage: 'Server error' });
  }
});

module.exports = router;
