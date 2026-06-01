-- 电商平台数据库初始化脚本
CREATE DATABASE IF NOT EXISTS ecommerce DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(500) DEFAULT NULL,
  category VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单主表
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单明细表
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 示例商品数据
INSERT INTO products (name, description, price, stock, category) VALUES
('无线蓝牙耳机', '高品质降噪蓝牙耳机，续航长达30小时，佩戴舒适', 299.00, 50, '电子产品'),
('机械键盘 RGB', '青轴机械键盘，104键全键无冲，RGB背光可调', 459.00, 30, '电子产品'),
('纯棉T恤 男款', '100%纯棉面料，透气舒适，多色可选', 89.00, 100, '服装'),
('JavaScript高级程序设计', '前端开发必读经典，第4版最新修订', 79.00, 8, '图书'),
('便携式充电宝 20000mAh', '大容量快充移动电源，支持Type-C双向快充', 129.00, 45, '电子产品'),
('运动跑鞋 女款', '轻便透气运动鞋，减震防滑，适合跑步健身', 269.00, 60, '服装'),
('Python编程从入门到实践', '零基础学Python，项目驱动式学习', 69.00, 5, '图书'),
('不锈钢保温杯 500ml', '316不锈钢内胆，12小时保温，商务便携', 99.00, 15, '生活用品'),
('双肩背包 商务款', '防水尼龙面料，可放15.6寸笔记本，多隔层设计', 199.00, 40, '生活用品'),
('智能手表 运动版', '心率监测，多种运动模式，IP68防水', 599.00, 25, '电子产品');
