/**
 * 商品列表与搜索模块 (用于 index.html)
 *
 * 功能：
 * 1. 商品网格展示
 * 2. 关键词搜索 (带防抖)
 * 3. 分类筛选
 * 4. 库存标签显示
 */

let currentCategory = '';
let currentKeyword = '';
let searchTimer = null;

/** 加载商品分类下拉框 */
async function loadCategories() {
  const res = await api.getCategories();
  if (res.code === 200) {
    const sel = document.getElementById('categoryFilter');
    res.data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      sel.appendChild(opt);
    });
  }
}

/** 加载商品列表 */
async function loadProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">加载中...</div>';

  const params = {};
  if (currentKeyword) params.keyword = currentKeyword;
  if (currentCategory) params.category = currentCategory;

  const res = await api.getProducts(params);
  if (res.code !== 200) {
    grid.innerHTML = `<div style="text-align:center;padding:40px;color:#999;">${res.message}</div>`;
    return;
  }

  if (res.data.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">暂无商品</div>';
    return;
  }

  grid.innerHTML = res.data.map(p => `
    <div class="product-card" onclick="location.href='product.html?id=${p.id}'">
      <div class="card-img cat-${p.category || ''}">${p.name.charAt(0)}</div>
      <div class="card-body">
        <h3 title="${p.name}">${p.name}</h3>
        <div class="price">${p.price}</div>
        <div class="meta">
          <span>${p.category || ''}</span>
          <span>${p.lowStock ? '<span class="badge badge-danger">库存紧张</span>' : '库存: ' + p.stock}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/** 初始化搜索与筛选事件 */
function initSearch() {
  // 搜索输入防抖 (300ms)
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentKeyword = e.target.value.trim();
      loadProducts();
    }, 300);
  });

  // 分类筛选
  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    currentCategory = e.target.value;
    loadProducts();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts();
  initSearch();
});
