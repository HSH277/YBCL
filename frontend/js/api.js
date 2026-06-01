/**
 * API 请求封装模块
 *
 * 功能：
 * 1. 统一请求地址和请求头配置
 * 2. 自动携带 JWT Token (从 localStorage 读取)
 * 3. 自动处理 401 响应 (跳转登录页)
 * 4. 统一错误处理
 */
const BASE_URL = 'http://localhost:3000/api';

/**
 * 检查 JWT Token 是否过期
 * 解析 token payload 中的 exp 字段 (Unix 时间戳)
 */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * 通用请求方法
 * @param {string} url - 请求路径 (不含 BASE_URL 前缀)
 * @param {object} options - fetch 配置项
 * @returns {object} 响应 JSON 数据
 */
async function request(url, options = {}) {
  let token = localStorage.getItem('token');

  // 前端预检: token 过期则直接跳转登录
  if (token && isTokenExpired(token)) {
    clearAuth();
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
    }
    return { code: 401, message: '登录已过期，请重新登录' };
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { headers, ...options };

  try {
    const res = await fetch(BASE_URL + url, config);
    const data = await res.json();

    // 401 响应处理: 清除本地 token 并跳转登录页
    if (res.status === 401) {
      clearAuth();
      if (!window.location.pathname.includes('login.html')) {
        alert('登录已过期，请重新登录');
        window.location.href = 'login.html';
      }
    }

    return data;
  } catch (err) {
    console.error('[API] 请求失败:', err.message);
    return { code: 500, message: '网络错误，请检查后端服务是否启动' };
  }
}

/** 清除本地认证信息 */
function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * API 接口集合
 * 按模块分组: auth / products / cart / orders
 */
const api = {
  // ==================== 认证模块 ====================
  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  verifyToken: () =>
    request('/auth/verify'),

  // ==================== 商品模块 ====================
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request('/products' + (query ? '?' + query : ''));
  },

  getProduct: (id) =>
    request('/products/' + id),

  getCategories: () =>
    request('/products/categories'),

  // ==================== 购物车模块 ====================
  getCart: () =>
    request('/cart'),

  addToCart: (body) =>
    request('/cart', { method: 'POST', body: JSON.stringify(body) }),

  updateCartItem: (id, body) =>
    request('/cart/' + id, { method: 'PUT', body: JSON.stringify(body) }),

  removeCartItem: (id) =>
    request('/cart/' + id, { method: 'DELETE' }),

  // ==================== 订单模块 ====================
  createOrder: () =>
    request('/orders', { method: 'POST' }),

  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request('/orders' + (query ? '?' + query : ''));
  },

  getOrderStats: () =>
    request('/orders/stats'),

  getOrder: (id) =>
    request('/orders/' + id),
};
