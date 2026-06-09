/**
 * 商品列表与搜索模块 (用于 index.html)
 *
 * 功能:
 * 1. 商品网格展示 (分页加载)
 * 2. 关键词搜索 (带防抖)
 * 3. 分类筛选
 * 4. 分页控件 (每页发送一次请求)
 * 5. 自动切换 Mock 模式 (后端不可用时)
 */

var currentCategory = '';
var currentKeyword = '';
var currentPage = 1;
var searchTimer = null;
var PAGE_SIZE = 6; // 每页显示6条

// ==================== 数据加载 ====================

/** 加载商品分类下拉框 */
async function loadCategories() {
  var res;
  if (Request.config.useMock) {
    res = await Mock.getCategories();
  } else {
    try {
      res = await Request.get('/products/categories');
    } catch (e) {
      // 后端不可用，切换 Mock
      Request.config.useMock = true;
      res = await Mock.getCategories();
    }
  }

  if (res.code === 200) {
    var sel = document.getElementById('categoryFilter');
    res.data.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      sel.appendChild(opt);
    });
  }
}

/** 加载商品列表 (分页) */
async function loadProducts() {
  var grid = document.getElementById('productGrid');
  grid.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">加载中...</div>';

  var params = {
    page: currentPage,
    pageSize: PAGE_SIZE
  };
  if (currentKeyword) params.keyword = currentKeyword;
  if (currentCategory) params.category = currentCategory;

  var res;
  if (Request.config.useMock) {
    res = await Mock.getProducts(params);
  } else {
    try {
      res = await Request.get('/products', params);
      // 后端返回格式适配: 如果后端直接返回数组，包装成分页格式
      if (res.code === 200 && Array.isArray(res.data)) {
        var total = res.data.length;
        var totalPages = Math.ceil(total / PAGE_SIZE);
        var start = (currentPage - 1) * PAGE_SIZE;
        var list = res.data.slice(start, start + PAGE_SIZE);
        res = {
          code: 200,
          data: {
            list: list,
            pagination: { page: currentPage, pageSize: PAGE_SIZE, total: total, totalPages: totalPages }
          }
        };
      }
    } catch (e) {
      // 后端不可用，切换 Mock
      Request.config.useMock = true;
      res = await Mock.getProducts(params);
    }
  }

  if (res.code !== 200) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">' + res.message + '</div>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  var data = res.data;
  var list = data.list || data;
  var pagination = data.pagination;

  if (!list || list.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">暂无商品</div>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  // 渲染商品卡片
  grid.innerHTML = list.map(function (p) {
    return '<div class="product-card" onclick="location.href=\'product.html?id=' + p.id + '\'">' +
      '<div class="card-img cat-' + (p.category || '') + '">' + p.name.charAt(0) + '</div>' +
      '<div class="card-body">' +
        '<h3 title="' + p.name + '">' + p.name + '</h3>' +
        '<div class="price">' + Number(p.price).toFixed(2) + '</div>' +
        '<div class="meta">' +
          '<span>' + (p.category || '') + '</span>' +
          '<span>' + (p.lowStock ? '<span class="badge badge-danger">库存紧张</span>' : '库存: ' + p.stock) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  // 渲染分页控件
  if (pagination && pagination.totalPages > 1) {
    renderPagination(pagination);
  } else {
    document.getElementById('pagination').innerHTML = '';
  }
}

/** 渲染分页控件 */
function renderPagination(pagination) {
  var el = document.getElementById('pagination');
  var html = '<div class="pagination-bar">';

  // 上一页
  html += '<button class="btn btn-outline btn-sm" ' +
    (pagination.page <= 1 ? 'disabled' : 'onclick="goPage(' + (pagination.page - 1) + ')"') +
    '>上一页</button>';

  // 页码按钮
  for (var i = 1; i <= pagination.totalPages; i++) {
    if (i === pagination.page) {
      html += '<button class="btn btn-primary btn-sm" disabled>' + i + '</button>';
    } else {
      html += '<button class="btn btn-outline btn-sm" onclick="goPage(' + i + ')">' + i + '</button>';
    }
  }

  // 下一页
  html += '<button class="btn btn-outline btn-sm" ' +
    (pagination.page >= pagination.totalPages ? 'disabled' : 'onclick="goPage(' + (pagination.page + 1) + ')"') +
    '>下一页</button>';

  // 分页信息
  html += '<span class="page-info">第 ' + pagination.page + '/' + pagination.totalPages +
    ' 页 (共 ' + pagination.total + ' 条)</span>';

  html += '</div>';
  el.innerHTML = html;
}

/** 跳转到指定页 */
function goPage(page) {
  currentPage = page;
  loadProducts();
  window.scrollTo(0, 0);
}

// ==================== 事件绑定 ====================

/** 初始化搜索与筛选事件 */
function initSearch() {
  // 搜索输入防抖 (300ms)
  document.getElementById('searchInput').addEventListener('input', function (e) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      currentKeyword = e.target.value.trim();
      currentPage = 1; // 搜索时重置到第1页
      loadProducts();
    }, 300);
  });

  // 分类筛选
  document.getElementById('categoryFilter').addEventListener('change', function (e) {
    currentCategory = e.target.value;
    currentPage = 1; // 筛选时重置到第1页
    loadProducts();
  });
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function () {
  loadCategories();
  loadProducts();
  initSearch();
});
