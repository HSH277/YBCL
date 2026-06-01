const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce_jwt_secret_key_2024';

/**
 * POST /api/auth/register
 * 用户注册
 * Body: { username, password, email }
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 输入校验
    if (!username || !password || !email) {
      return res.status(400).json({ code: 400, message: '用户名、密码和邮箱不能为空' });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ code: 400, message: '用户名长度应为3-20个字符' });
    }
    if (password.length < 6) {
      return res.status(400).json({ code: 400, message: '密码长度至少6位' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ code: 400, message: '邮箱格式不正确' });
    }

    // 检查用户名是否已存在
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }

    // 密码加密 (bcrypt, salt rounds = 10)
    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
      [username, password_hash, email]
    );

    console.log(`[AUTH] 新用户注册: ${username}`);
    res.json({ code: 200, message: '注册成功' });
  } catch (err) {
    console.error('[AUTH] 注册失败:', err.message);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 * Body: { username, password }
 * 返回: { token, user }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }

    // 查询用户
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }

    const user = rows[0];

    // 验证密码 (bcrypt compare)
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }

    // 生成 JWT Token
    // payload 包含用户 id 和 username
    // 有效期 7 天
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[AUTH] 用户登录: ${username}`);
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email }
      }
    });
  } catch (err) {
    console.error('[AUTH] 登录失败:', err.message);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/auth/verify
 * 验证当前 token 是否有效
 * Header: Authorization: Bearer <token>
 */
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({
      code: 200,
      message: 'Token 有效',
      data: { user: rows[0] }
    });
  } catch (err) {
    console.error('[AUTH] Token 验证失败:', err.message);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
