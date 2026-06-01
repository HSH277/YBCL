const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 中间件 ====================

// CORS 跨域配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON 请求体解析
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleString('zh-CN');
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 400 ? 'WARN' : 'INFO';
    console.log(`  [${level}] ${status} - ${duration}ms`);
  });

  next();
});

// ==================== 路由 ====================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== 错误处理 ====================

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: `接口不存在: ${req.method} ${req.url}` });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  console.error(err.stack);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// ==================== 启动 ====================

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`  电商平台后端服务已启动`);
  console.log(`  地址: http://localhost:${PORT}`);
  console.log(`  健康检查: http://localhost:${PORT}/api/health`);
  console.log('========================================');
});
