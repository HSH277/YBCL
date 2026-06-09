/**
 * mock.js — Mock 数据模块
 *
 * 功能:
 * 1. 模拟后端 API 返回数据
 * 2. 支持分页查询 (每页发送一次请求)
 * 3. 支持关键词搜索 + 分类筛选
 * 4. 模拟网络延迟 (200-500ms)
 */
const Mock = (function () {

  // ==================== 商品数据 (30条) ====================
  var allProducts = [
    { id: 1,  name: '无线蓝牙耳机',          price: 299.00,  stock: 50,  category: '电子产品', description: '高品质降噪蓝牙耳机，续航长达30小时' },
    { id: 2,  name: '机械键盘 RGB',          price: 459.00,  stock: 30,  category: '电子产品', description: '青轴机械键盘，104键全键无冲' },
    { id: 3,  name: '纯棉T恤 男款',          price: 89.00,   stock: 100, category: '服装',     description: '100%纯棉面料，透气舒适' },
    { id: 4,  name: 'JavaScript高级程序设计',  price: 79.00,   stock: 8,   category: '图书',     description: '前端开发必读经典，第4版' },
    { id: 5,  name: '便携式充电宝 20000mAh',  price: 129.00,  stock: 45,  category: '电子产品', description: '大容量快充移动电源' },
    { id: 6,  name: '运动跑鞋 女款',          price: 269.00,  stock: 60,  category: '服装',     description: '轻便透气运动鞋，减震防滑' },
    { id: 7,  name: 'Python编程从入门到实践',  price: 69.00,   stock: 5,   category: '图书',     description: '零基础学Python' },
    { id: 8,  name: '不锈钢保温杯 500ml',     price: 99.00,   stock: 15,  category: '生活用品', description: '316不锈钢内胆，12小时保温' },
    { id: 9,  name: '双肩背包 商务款',        price: 199.00,  stock: 40,  category: '生活用品', description: '防水尼龙面料，可放15.6寸笔记本' },
    { id: 10, name: '智能手表 运动版',        price: 599.00,  stock: 25,  category: '电子产品', description: '心率监测，多种运动模式' },
    { id: 11, name: '无线鼠标 静音版',        price: 79.00,   stock: 80,  category: '电子产品', description: '2.4G无线连接，静音微动' },
    { id: 12, name: '纯棉衬衫 商务白',        price: 159.00,  stock: 45,  category: '服装',     description: '免烫处理，商务百搭' },
    { id: 13, name: 'Vue.js设计与实现',       price: 89.00,   stock: 12,  category: '图书',     description: '深入理解Vue.js核心思想' },
    { id: 14, name: '桌面台灯 护眼版',        price: 169.00,  stock: 35,  category: '生活用品', description: '无频闪，色温可调' },
    { id: 15, name: 'TypeScript实战',         price: 69.00,   stock: 20,  category: '图书',     description: '类型体操与工程实践' },
    { id: 16, name: '真无线耳机 降噪版',      price: 399.00,  stock: 28,  category: '电子产品', description: '主动降噪，通透模式' },
    { id: 17, name: '休闲卫衣 连帽款',        price: 139.00,  stock: 70,  category: '服装',     description: '加绒保暖，潮流百搭' },
    { id: 18, name: '电动牙刷 声波款',        price: 249.00,  stock: 22,  category: '生活用品', description: '5种清洁模式，续航30天' },
    { id: 19, name: '显示器 27寸 4K',         price: 1899.00, stock: 10,  category: '电子产品', description: 'IPS面板，Type-C一线连接' },
    { id: 20, name: 'React技术揭秘',          price: 79.00,   stock: 18,  category: '图书',     description: '深入React内部机制' },
    { id: 21, name: '牛仔裤 直筒款',          price: 189.00,  stock: 55,  category: '服装',     description: '弹力面料，修身显瘦' },
    { id: 22, name: '蓝牙音箱 户外版',        price: 329.00,  stock: 33,  category: '电子产品', description: 'IPX7防水，24小时续航' },
    { id: 23, name: '保温饭盒 三层款',        price: 129.00,  stock: 40,  category: '生活用品', description: '304不锈钢，6小时保温' },
    { id: 24, name: 'Node.js实战',            price: 69.00,   stock: 15,  category: '图书',     description: '后端开发全栈指南' },
    { id: 25, name: '帆布鞋 低帮款',          price: 99.00,   stock: 90,  category: '服装',     description: '经典百搭，舒适透气' },
    { id: 26, name: '移动硬盘 1TB',           price: 399.00,  stock: 20,  category: '电子产品', description: 'USB3.2高速传输' },
    { id: 27, name: '雨伞 自动款',            price: 59.00,   stock: 60,  category: '生活用品', description: '一键开合，防风骨架' },
    { id: 28, name: '算法导论',               price: 128.00,  stock: 8,   category: '图书',     description: '计算机科学经典教材' },
    { id: 29, name: '夹克 防风款',            price: 299.00,  stock: 35,  category: '服装',     description: '防风防水，轻量保暖' },
    { id: 30, name: '充电器 65W GaN',         price: 149.00,  stock: 50,  category: '电子产品', description: '氮化镓快充，多口输出' },
  ];

  // ==================== Mock API 处理器 ====================

  /**
   * 模拟商品列表查询 (分页 + 筛选)
   * @param {object} params - { keyword, category, page, pageSize }
   * @returns {object} 模拟响应
   */
  function mockGetProducts(params) {
    params = params || {};
    var keyword = params.keyword || '';
    var category = params.category || '';
    var page = parseInt(params.page) || 1;
    var pageSize = parseInt(params.pageSize) || 6;

    // 筛选
    var filtered = allProducts.filter(function (p) {
      var matchKeyword = !keyword || p.name.indexOf(keyword) !== -1;
      var matchCategory = !category || p.category === category;
      return matchKeyword && matchCategory;
    });

    // 分页
    var total = filtered.length;
    var totalPages = Math.ceil(total / pageSize);
    var start = (page - 1) * pageSize;
    var list = filtered.slice(start, start + pageSize);

    // 添加 lowStock 标记
    list = list.map(function (p) {
      return Object.assign({}, p, { lowStock: p.stock < 10 });
    });

    return {
      code: 200,
      data: {
        list: list,
        pagination: {
          page: page,
          pageSize: pageSize,
          total: total,
          totalPages: totalPages
        }
      }
    };
  }

  /**
   * 模拟分类查询
   */
  function mockGetCategories() {
    var categories = [];
    allProducts.forEach(function (p) {
      if (categories.indexOf(p.category) === -1) {
        categories.push(p.category);
      }
    });
    return { code: 200, data: categories };
  }

  /**
   * 模拟商品详情
   */
  function mockGetProduct(id) {
    var product = allProducts.find(function (p) { return p.id === parseInt(id); });
    if (!product) return { code: 404, message: '商品不存在' };
    product = Object.assign({}, product, { lowStock: product.stock < 10 });
    return { code: 200, data: product };
  }

  /**
   * 模拟请求 (带延迟)
   * @param {string} type - 'products' | 'categories' | 'product'
   * @param {object} params - 参数
   * @returns {Promise<object>} 模拟响应
   */
  function mockRequest(type, params) {
    return new Promise(function (resolve) {
      var delay = 200 + Math.random() * 300; // 200-500ms 随机延迟
      setTimeout(function () {
        switch (type) {
          case 'products':
            resolve(mockGetProducts(params));
            break;
          case 'categories':
            resolve(mockGetCategories());
            break;
          case 'product':
            resolve(mockGetProduct(params));
            break;
          default:
            resolve({ code: 404, message: '未知接口' });
        }
      }, delay);
    });
  }

  return {
    getProducts: function (params) { return mockRequest('products', params); },
    getCategories: function () { return mockRequest('categories'); },
    getProduct: function (id) { return mockRequest('product', id); },
  };
})();
