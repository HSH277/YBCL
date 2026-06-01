# AI 提问内容记录

本文档记录了在电商平台开发过程中，与 AI 工具交互的完整提问内容与关键回复摘要。

---

## 第一轮：项目初始化与架构设计

### 提问 1：技术选型确认

**提问内容：**
> 本次实验围绕电商购物平台完成了全流程设计与实践：首先针对商品展示、商品搜索、
> 加购物车、下单、订单管理五大核心需求，结合用户购物全流程拆解功能要点、业务逻辑
> 与设计注意事项，补充库存提醒、搜索推荐等实用细节；随后采用前后端分离架构，划分
> 前端页面层、后端接口层、数据库层，明确各层核心模块与数据表关联及数据交互逻辑，
> 完成架构图绘制；同时借助 AI 工具辅助完善需求分析、梳理架构设计，规范专业术语并
> 记录使用过程；最终完成完整的需求分析、架构设计与 AI 工具使用总结，接下来可基于
> 这套成熟的需求与架构方案，直接在 VS Code 中调用 AI 模型，快速生成前后端分离的
> 电商平台核心代码，实现商品、购物车、订单等模块的接口开发与页面功能落地。

**AI 回复摘要：**
- 确认技术栈：前端原生 HTML/CSS/JS，后端 Node.js + Express，数据库 MySQL
- 设计了完整的项目目录结构（backend/ + frontend/）
- 设计了 5 张数据表（users, products, cart_items, orders, order_items）
- 设计了 4 组 API 路由（auth, products, cart, orders）
- 规划了 5 个前端页面（login, index, product, cart, orders）

---

## 第二轮：核心代码生成

### 提问 2：后端代码实现

**提问内容（隐含在执行过程中）：**
> 按照方案实现后端代码：数据库初始化脚本、Express 服务器、JWT 认证中间件、
> 商品/购物车/订单路由、MySQL 连接池。

**AI 执行内容：**
1. 创建 `backend/package.json` — 配置依赖（express, mysql2, jsonwebtoken, bcryptjs, cors, dotenv）
2. 创建 `backend/init.sql` — 建库建表 + 10条示例商品数据
3. 创建 `backend/db.js` — MySQL 连接池配置
4. 创建 `backend/middleware/auth.js` — JWT 验证中间件
5. 创建 `backend/routes/auth.js` — 注册/登录接口
6. 创建 `backend/routes/products.js` — 商品列表/搜索/详情接口
7. 创建 `backend/routes/cart.js` — 购物车 CRUD + 库存校验
8. 创建 `backend/routes/orders.js` — 下单(事务)/订单列表/详情接口
9. 创建 `backend/server.js` — Express 入口 + 中间件配置
10. 执行 `npm install` 安装依赖

### 提问 3：前端代码实现

**提问内容（隐含在执行过程中）：**
> 按照方案实现前端代码：HTML 页面、CSS 样式、JavaScript 交互逻辑。

**AI 执行内容：**
1. 创建 `frontend/css/style.css` — 全局样式（导航栏、商品卡片、表单、购物车表格、订单卡片等）
2. 创建 `frontend/js/api.js` — API 请求封装（fetch + JWT Token 自动携带 + 401 处理）
3. 创建 `frontend/js/auth.js` — 登录状态管理（导航栏更新、登出、高亮当前页）
4. 创建 `frontend/js/products.js` — 商品列表/搜索逻辑
5. 创建 `frontend/js/cart.js` — 购物车逻辑
6. 创建 `frontend/js/orders.js` — 订单列表/详情逻辑
7. 创建 `frontend/login.html` — 登录/注册页面
8. 创建 `frontend/index.html` — 首页（商品展示 + 搜索）
9. 创建 `frontend/product.html` — 商品详情页
10. 创建 `frontend/cart.html` — 购物车页
11. 创建 `frontend/orders.html` — 订单管理页

---

## 第三轮：功能增强与工程化优化

### 提问 4：完善登录验证与订单查询

**提问内容：**
> 完善电商购物平台，添加用户登录（token 验证）、订单列表查询等功能，实现前后端
> 完整交互；按工程化规范优化所有代码。

**AI 执行内容：**

#### 后端优化
1. **server.js** — 添加请求日志中间件、CORS 详细配置、404 处理、全局错误处理
2. **middleware/auth.js** — 增强 token 验证：区分过期/无效错误、空 token 检查、详细错误信息返回
3. **routes/auth.js** — 添加输入校验（用户名长度、邮箱格式、密码强度）、新增 `/verify` Token 验证接口
4. **routes/orders.js** — 添加状态筛选、分页查询（page/limit/offset）、订单统计接口（`/stats`）、事务中增加库存二次校验

#### 前端优化
5. **js/api.js** — 添加 `isTokenExpired()` 前端 token 过期预检、`clearAuth()` 统一清理、`verifyToken()` 接口调用
6. **js/auth.js** — 添加 `requireAuth()` 登录守卫、`verifyAuth()` token 有效性验证、导航栏登录/未登录状态区分
7. **js/products.js** — 添加搜索防抖（300ms）、代码注释
8. **js/cart.js** — 添加登录守卫 `requireAuth()`、数量合法性校验
9. **js/orders.js** — 重写支持状态筛选、分页控件、订单统计展示、详情视图
10. **login.html** — 已登录用户自动验证 token 并跳转、输入校验增强
11. **orders.html** — 添加统计栏、状态筛选按钮栏、分页区域、样式

#### 工程化
12. 创建 `.gitignore` — 排除 node_modules、.env 等

---

## AI 工具使用总结

### 使用场景

| 场景 | 说明 |
|------|------|
| 需求分析 | 拆解电商五大核心模块的功能要点和业务逻辑 |
| 架构设计 | 设计前后端分离架构、数据库表结构、API 接口 |
| 代码生成 | 一次性生成完整的后端路由、中间件、前端页面和交互逻辑 |
| 代码优化 | 增强安全性（token 验证、输入校验）、提升工程化水平 |
| 文档编写 | 生成技术原理说明和前后端交互流程文档 |

### 使用效果

- **效率提升**: 从零到完整可运行的全栈项目，AI 辅助大幅缩短开发周期
- **规范性**: AI 生成的代码遵循 RESTful API 设计规范，使用参数化查询防 SQL 注入
- **完整性**: 覆盖了从数据库建表到前端页面渲染的完整链路
- **可迭代性**: 基于首轮生成的基础代码，后续可通过对话逐步增强功能

### 注意事项

- AI 生成的代码需要人工审查，特别是安全相关的逻辑（密码加密、token 验证、SQL 注入防护）
- 数据库连接配置（.env 文件）需要根据实际环境修改
- 生成的代码是基础实现，生产环境还需添加限流、日志持久化、监控等
