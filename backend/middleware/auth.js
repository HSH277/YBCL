const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce_jwt_secret_key_2024';

/**
 * JWT 验证中间件
 *
 * 工作原理：
 * 1. 从请求头 Authorization 字段提取 Bearer Token
 * 2. 使用 jwt.verify() 验证 token 的签名和有效期
 * 3. 验证通过后将解码的用户信息挂载到 req.user
 * 4. 后续路由可通过 req.user.id 获取当前登录用户ID
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  // 检查 Authorization 头是否存在且格式正确
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '请先登录',
      detail: '缺少 Authorization 请求头'
    });
  }

  const token = header.split(' ')[1];

  // 检查 token 是否为空
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({
      code: 401,
      message: '请先登录',
      detail: 'Token 为空'
    });
  }

  try {
    // 验证 token 签名和有效期
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, iat, exp }
    next();
  } catch (err) {
    // 区分 token 过期和其他错误
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '登录已过期，请重新登录',
        detail: 'token_expired'
      });
    }
    return res.status(401).json({
      code: 401,
      message: '登录验证失败，请重新登录',
      detail: 'token_invalid'
    });
  }
}

module.exports = authMiddleware;
