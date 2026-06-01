/**
 * 登录状态管理模块
 *
 * 功能：
 * 1. 登录状态检测 (isLoggedIn / getUser)
 * 2. 页面加载时验证 token 有效性
 * 3. 导航栏动态更新 (显示/隐藏登录相关元素)
 * 4. 登出处理
 */

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

/**
 * 页面加载时验证 token 有效性
 * 调用后端 /api/auth/verify 接口确认 token 未被篡改
 */
async function verifyAuth() {
  if (!isLoggedIn()) return false;

  const res = await api.verifyToken();
  if (res.code !== 200) {
    clearAuth();
    return false;
  }
  return true;
}

/**
 * 登录守卫: 要求必须登录才能访问当前页面
 * 未登录或 token 无效则跳转到登录页
 */
async function requireAuth() {
  const valid = await verifyAuth();
  if (!valid) {
    alert('请先登录');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/** 更新导航栏用户状态 */
function updateNav() {
  const userEl = document.getElementById('userDisplay');
  const logoutBtn = document.getElementById('btnLogout');
  const cartLink = document.getElementById('cartLink');
  const ordersLink = document.getElementById('ordersLink');
  const loginLink = document.getElementById('loginLink');

  if (isLoggedIn()) {
    const user = getUser();
    if (userEl) userEl.textContent = user ? `欢迎, ${user.username}` : '';
    if (logoutBtn) logoutBtn.style.display = '';
    if (cartLink) cartLink.style.display = '';
    if (ordersLink) ordersLink.style.display = '';
    if (loginLink) loginLink.style.display = 'none';
  } else {
    if (userEl) userEl.textContent = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (cartLink) cartLink.style.display = 'none';
    if (ordersLink) ordersLink.style.display = 'none';
    if (loginLink) loginLink.style.display = '';
  }
}

/** 高亮当前页导航链接 */
function highlightNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) {
      a.classList.add('active');
    }
  });
}

/** 页面初始化 */
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  highlightNav();

  const btn = document.getElementById('btnLogout');
  if (btn) btn.addEventListener('click', logout);
});
