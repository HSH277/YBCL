# 电商平台 - 前后端分离全栈项目

前后端分离的电商购物平台，涵盖商品展示、搜索、购物车、下单、订单管理五大核心模块。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML / CSS / JavaScript |
| 后端 | Node.js + Express |
| 数据库 | MySQL |
| 认证 | JWT (JSON Web Token) + bcrypt |

## 项目结构

```
├── backend/                    # 后端服务
│   ├── server.js               # Express 入口
│   ├── db.js                   # MySQL 连接池
│   ├── init.sql                # 数据库初始化脚本
│   ├── .env                    # 环境变量配置
│   ├── middleware/
│   │   └── auth.js             # JWT 认证中间件
│   └── routes/
│       ├── auth.js             # 注册/登录/Token验证
│       ├── products.js         # 商品列表/搜索/详情
│       ├── cart.js             # 购物车增删改查
│       └── orders.js           # 下单/订单列表/详情
├── frontend/                   # 前端页面
│   ├── login.html              # 登录/注册
│   ├── index.html              # 首页 - 商品展示与搜索
│   ├── product.html            # 商品详情
│   ├── cart.html               # 购物车
│   ├── orders.html             # 订单管理
│   ├── css/style.css           # 全局样式
│   └── js/
│       ├── api.js              # API 请求封装
│       ├── auth.js             # 登录状态管理
│       ├── products.js         # 商品页面逻辑
│       ├── cart.js             # 购物车逻辑
│       └── orders.js           # 订单逻辑
└── docs/                       # 文档
    ├── 1-登录验证原理说明.md
    ├── 2-查询功能前后端工作过程.md
    └── 3-AI提问内容记录.md
```

## 快速开始

### 1. 环境要求

- Node.js >= 16
- MySQL >= 5.7

### 2. 初始化数据库

修改 `backend/.env` 中的 MySQL 连接信息，然后执行：

```bash
mysql -u root -p < backend/init.sql
```

### 3. 启动后端

```bash
cd backend
npm install
node server.js
```

服务启动在 http://localhost:3000

### 4. 启动前端

使用 VS Code 的 Live Server 插件打开 `frontend/` 目录，或直接在浏览器中打开 `frontend/login.html`。

### 5. 测试流程

注册账号 → 登录 → 浏览商品 → 搜索/筛选 → 加入购物车 → 去结算 → 查看订单

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| GET | /api/auth/verify | 验证Token | 是 |
| GET | /api/products | 商品列表/搜索 | 否 |
| GET | /api/products/:id | 商品详情 | 否 |
| GET | /api/products/categories | 分类列表 | 否 |
| GET | /api/cart | 购物车列表 | 是 |
| POST | /api/cart | 添加到购物车 | 是 |
| PUT | /api/cart/:id | 修改数量 | 是 |
| DELETE | /api/cart/:id | 删除商品 | 是 |
| POST | /api/orders | 创建订单 | 是 |
| GET | /api/orders | 订单列表 | 是 |
| GET | /api/orders/stats | 订单统计 | 是 |
| GET | /api/orders/:id | 订单详情 | 是 |

## 核心功能

- **用户认证**: JWT Token 机制，7天有效期，bcrypt 密码加密
- **商品搜索**: 关键词模糊匹配 + 分类筛选，前端防抖优化
- **购物车**: 库存校验、重复商品合并、数量修改
- **订单管理**: 事务操作（扣库存+创建订单+清购物车）、状态筛选、分页查询
- **库存提醒**: 库存 < 10 时显示"库存紧张"标签
