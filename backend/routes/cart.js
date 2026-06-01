const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// 获取购物车列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.id DESC`,
      [req.user.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    console.error('查询购物车失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 添加到购物车
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) {
      return res.status(400).json({ code: 400, message: '商品ID不能为空' });
    }

    // 检查商品库存
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    if (products[0].stock < quantity) {
      return res.status(400).json({ code: 400, message: `库存不足，当前库存: ${products[0].stock}` });
    }

    // 检查购物车是否已有该商品
    const [existing] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      if (newQty > products[0].stock) {
        return res.status(400).json({ code: 400, message: `库存不足，购物车已有 ${existing[0].quantity} 件` });
      }
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
    } else {
      await pool.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]);
    }

    res.json({ code: 200, message: '已添加到购物车' });
  } catch (err) {
    console.error('添加购物车失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 修改购物车数量
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ code: 400, message: '数量不合法' });
    }

    // 校验归属
    const [items] = await pool.query('SELECT c.*, p.stock FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?',
      [req.params.id, req.user.id]);
    if (items.length === 0) {
      return res.status(404).json({ code: 404, message: '购物车记录不存在' });
    }
    if (quantity > items[0].stock) {
      return res.status(400).json({ code: 400, message: `库存不足，最多可添加 ${items[0].stock} 件` });
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    res.json({ code: 200, message: '已更新数量' });
  } catch (err) {
    console.error('更新购物车失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除购物车商品
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ code: 200, message: '已移除' });
  } catch (err) {
    console.error('删除购物车失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
