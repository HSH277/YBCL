/**
 * 订单管理模块 (用于 orders.html)
 *
 * 功能：
 * 1. 订单列表展示 (支持状态筛选)
 * 2. 分页加载
 * 3. 订单统计 (各状态数量)
 * 4. 订单详情查看
 */

const statusMap = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
};

const statusClass = {
  pending: 'status-pending',
  paid: 'status-paid',
  shipped: 'status-shipped',
  completed: 'status-completed',
  cancelled: 'status-cancelled'
};

let currentPage = 1;
let currentStatus = '';
const PAGE_SIZE = 10;

/** 加载订单统计 */
async function loadStats() {
  const res = await api.getOrderStats();
  if (res.code !== 200) return;

  const stats = res.data;
  const statsEl = document.getElementById('orderStats');
  if (!statsEl) return;

  const total = Object.values(stats).reduce((s, n) => s + n, 0);
  statsEl.innerHTML = `
    <span class="stat-item">全部: <strong>${total}</strong></span>
    ${stats.pending ? `<span class="stat-item status-pending">待付款: <strong>${stats.pending}</strong></span>` : ''}
    ${stats.paid ? `<span class="stat-item status-paid">已付款: <strong>${stats.paid}</strong></span>` : ''}
    ${stats.shipped ? `<span class="stat-item status-shipped">已发货: <strong>${stats.shipped}</strong></span>` : ''}
    ${stats.completed ? `<span class="stat-item status-completed">已完成: <strong>${stats.completed}</strong></span>` : ''}
  `;
}

/** 加载订单列表 */
async function loadOrders() {
  const container = document.getElementById('orderList');
  container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">加载中...</div>';

  const params = { page: currentPage, limit: PAGE_SIZE };
  if (currentStatus) params.status = currentStatus;

  const res = await api.getOrders(params);
  if (res.code !== 200) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:#999;">加载失败: ${res.message}</div>`;
    return;
  }

  const { list, pagination } = res.data;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="icon">📦</div>
        <p>暂无订单</p>
        <a href="index.html" style="color:var(--primary);">去逛逛</a>
      </div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  container.innerHTML = list.map(order => `
    <div class="order-card">
      <div class="order-header">
        <span>订单号: <strong>#${order.id}</strong></span>
        <span>${new Date(order.created_at).toLocaleString('zh-CN')}</span>
        <span class="${statusClass[order.status] || ''}">${statusMap[order.status] || order.status}</span>
        <span>总额: <strong style="color:var(--danger)">¥${Number(order.total_amount).toFixed(2)}</strong></span>
      </div>
      <div class="order-body">
        <button class="btn btn-outline btn-sm" onclick="viewDetail(${order.id})">查看详情</button>
      </div>
    </div>
  `).join('');

  // 渲染分页
  renderPagination(pagination);
}

/** 渲染分页控件 */
function renderPagination(pagination) {
  const el = document.getElementById('pagination');
  if (!el || pagination.totalPages <= 1) {
    if (el) el.innerHTML = '';
    return;
  }

  let html = '<div class="pagination-bar">';
  html += `<button class="btn btn-outline btn-sm" ${currentPage <= 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">上一页</button>`;
  html += `<span class="page-info">第 ${pagination.page} / ${pagination.totalPages} 页 (共 ${pagination.total} 条)</span>`;
  html += `<button class="btn btn-outline btn-sm" ${currentPage >= pagination.totalPages ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">下一页</button>`;
  html += '</div>';
  el.innerHTML = html;
}

/** 跳转到指定页 */
function goPage(page) {
  currentPage = page;
  loadOrders();
  window.scrollTo(0, 0);
}

/** 切换状态筛选 */
function filterByStatus(status) {
  currentStatus = status;
  currentPage = 1;

  // 更新按钮选中状态
  document.querySelectorAll('.status-filter .btn').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline');
  });
  event.target.classList.remove('btn-outline');
  event.target.classList.add('btn-primary');

  loadOrders();
}

/** 查看订单详情 */
async function viewDetail(orderId) {
  const res = await api.getOrder(orderId);
  if (res.code !== 200) {
    alert(res.message);
    return;
  }

  const order = res.data;
  const container = document.getElementById('orderList');

  container.innerHTML = `
    <div style="background:#fff;padding:24px;border-radius:8px;box-shadow:var(--shadow);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3>订单 #${order.id} 详情</h3>
        <button class="btn btn-outline btn-sm" onclick="loadOrders()">← 返回列表</button>
      </div>
      <div style="color:var(--text-secondary);margin-bottom:16px;font-size:14px;">
        下单时间: ${new Date(order.created_at).toLocaleString('zh-CN')} &nbsp;|&nbsp;
        状态: <span class="${statusClass[order.status]}">${statusMap[order.status]}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="padding:12px;text-align:left;">商品</th>
            <th style="padding:12px;text-align:left;">分类</th>
            <th style="padding:12px;text-align:right;">单价</th>
            <th style="padding:12px;text-align:center;">数量</th>
            <th style="padding:12px;text-align:right;">小计</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:12px;">${item.name}</td>
              <td style="padding:12px;color:var(--text-secondary);">${item.category || '-'}</td>
              <td style="padding:12px;text-align:right;">¥${Number(item.price).toFixed(2)}</td>
              <td style="padding:12px;text-align:center;">${item.quantity}</td>
              <td style="padding:12px;text-align:right;">¥${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align:right;margin-top:20px;padding-top:16px;border-top:2px solid var(--border);">
        <span style="font-size:18px;">
          合计: <strong style="color:var(--danger);font-size:22px;">¥${Number(order.total_amount).toFixed(2)}</strong>
        </span>
      </div>
    </div>`;

  document.getElementById('pagination').innerHTML = '';
}

/** 页面初始化 */
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadOrders();
});
