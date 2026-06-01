const express = require('express');
const pool = require('../db');

const router = express.Router();

// 商品列表 (支持关键词搜索 + 分类筛选)
router.get('/', async (req, res) => {
  try {
    const { keyword, category } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND name LIKE ?';
      params.push(`%${keyword}%`);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);

    // 为每个商品添加库存提醒标记
    const products = rows.map(p => ({
      ...p,
      lowStock: p.stock < 10
    }));

    res.json({ code: 200, data: products });
  } catch (err) {
    console.error('查询商品失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取所有分类
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
    const categories = rows.map(r => r.category);
    res.json({ code: 200, data: categories });
  } catch (err) {
    console.error('查询分类失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 商品详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    const product = rows[0];
    product.lowStock = product.stock < 10;
    res.json({ code: 200, data: product });
  } catch (err) {
    console.error('查询商品详情失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
