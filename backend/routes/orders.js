const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

/**
 * POST /api/orders
 * 创建订单 (事务操作)
 * 流程: 校验购物车 → 校验库存 → 创建订单 → 创建明细 → 扣库存 → 清购物车
 */
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. 查询当前用户购物车
    const [cartItems] = await conn.query(
      `SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.name, p.price, p.stock
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await conn.rollback();
      return res.status(400).json({ code: 400, message: '购物车为空' });
    }

    // 2. 二次校验库存 (防止并发超卖)
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await conn.rollback();
        return res.status(400).json({
          code: 400,
          message: `"${item.name}" 库存不足，当前库存: ${item.stock}`
        });
      }
    }

    // 3. 计算总金额
    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity, 0
    );

    // 4. 创建订单主记录
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.user.id, total, 'pending']
    );
    const orderId = orderResult.insertId;

    // 5. 创建订单明细 + 扣减库存
    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantity, item.product_id, item.quantity]
      );
    }

    // 6. 清空购物车
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await conn.commit();
    console.log(`[ORDER] 用户 ${req.user.username} 创建订单 #${orderId}, 金额: ¥${total.toFixed(2)}`);
    res.json({
      code: 200,
      message: '下单成功',
      data: { order_id: orderId, total_amount: total }
    });
  } catch (err) {
    await conn.rollback();
    console.error('[ORDER] 下单失败:', err.message);
    res.status(500).json({ code: 500, message: '服务器错误' });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/orders
 * 订单列表查询 (支持状态筛选 + 分页)
 * Query: status=pending&page=1&limit=10
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * pageSize;

    // 构建查询条件
    let where = 'WHERE o.user_id = ?';
    const params = [req.user.id];

    if (status) {
      where += ' AND o.status = ?';
      params.push(status);
    }

    // 查询总数 (用于分页)
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o ${where}`,
      params
    );
    const total = countResult[0].total;

    // 查询订单列表
    const [rows] = await pool.query(
      `SELECT o.* FROM orders o ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      code: 200,
      data: {
        list: rows,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (err) {
    console.error('[ORDER] 查询订单列表失败:', err.message);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/orders/stats
 * 订单统计 (各状态数量)
 */
router.get('/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM orders WHERE user_id = ? GROUP BY status`,
      [req.user.id]
    );
    const stats = {};
    rows.forEach(r => { stats[r.status] = r.count; });
    res.json({ code: 200, data: stats });
  } catch (err) {
    console.error('[ORDER] 查询订单统计失败:', err.message);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/orders/:id
 * 订单详情 (含商品明细)
 */
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (orders.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image, p.category
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({
      code: 200,
      data: { ...orders[0], items }
    });
  } catch (err) {
    console.error('[ORDER] 查询订单详情失败:', err.message);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
