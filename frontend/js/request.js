/**
 * request.js — 独立的异步请求工具
 *
 * 特点:
 * 1. 基于 XMLHttpRequest + Promise 封装 (不依赖 fetch)
 * 2. 支持请求/响应拦截器
 * 3. 支持 Mock 数据模式 (无需后端也能运行)
 * 4. 自动携带 JWT Token
 * 5. 统一错误处理
 */
const Request = (function () {

  // ==================== 配置 ====================
  const config = {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    useMock: false,  // 是否使用 Mock 数据 (后端未启动时自动切换)
  };

  // 请求拦截器队列
  const requestInterceptors = [];
  // 响应拦截器队列
  const responseInterceptors = [];

  // ==================== 核心请求方法 ====================

  /**
   * 发送 HTTP 请求
   * @param {object} options - 请求配置
   * @param {string} options.method - 请求方法 GET/POST/PUT/DELETE
   * @param {string} options.url - 请求路径
   * @param {object} [options.data] - 请求体数据
   * @param {object} [options.params] - URL 查询参数
   * @param {object} [options.headers] - 自定义请求头
   * @returns {Promise<object>} 响应数据
   */
  function request(options) {
    return new Promise(function (resolve, reject) {
      // 合并配置
      var method = (options.method || 'GET').toUpperCase();
      var url = config.baseURL + options.url;
      var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers);
      var data = options.data || null;
      var params = options.params || {};

      // 执行请求拦截器
      for (var i = 0; i < requestInterceptors.length; i++) {
        var result = requestInterceptors[i]({ method: method, url: url, headers: headers, data: data, params: params });
        if (result) {
          method = result.method || method;
          url = result.url || url;
          headers = result.headers || headers;
          data = result.data || data;
          params = result.params || params;
        }
      }

      // 拼接查询参数
      var queryString = buildQueryString(params);
      if (queryString) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + queryString;
      }

      // 创建 XMLHttpRequest
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.timeout = config.timeout;

      // 设置请求头
      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }

      // 响应处理
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        var responseData;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (e) {
          responseData = { code: xhr.status, message: xhr.responseText || '响应解析失败' };
        }

        // 执行响应拦截器
        for (var j = 0; j < responseInterceptors.length; j++) {
          var intercepted = responseInterceptors[j](responseData, xhr.status);
          if (intercepted !== undefined) responseData = intercepted;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(responseData);
        } else {
          reject({ status: xhr.status, data: responseData });
        }
      };

      // 超时处理
      xhr.ontimeout = function () {
        reject({ status: 0, data: { code: 0, message: '请求超时' } });
      };

      // 网络错误
      xhr.onerror = function () {
        reject({ status: 0, data: { code: 0, message: '网络错误，请检查后端服务是否启动' } });
      };

      // 发送请求
      xhr.send(data ? JSON.stringify(data) : null);
    });
  }

  // ==================== 便捷方法 ====================

  function get(url, params) {
    return request({ method: 'GET', url: url, params: params });
  }

  function post(url, data) {
    return request({ method: 'POST', url: url, data: data });
  }

  function put(url, data) {
    return request({ method: 'PUT', url: url, data: data });
  }

  function del(url) {
    return request({ method: 'DELETE', url: url });
  }

  // ==================== 拦截器 ====================

  function addRequestInterceptor(fn) {
    requestInterceptors.push(fn);
  }

  function addResponseInterceptor(fn) {
    responseInterceptors.push(fn);
  }

  // ==================== 工具函数 ====================

  /** 将对象转为 URL 查询字符串 */
  function buildQueryString(params) {
    if (!params || typeof params !== 'object') return '';
    var parts = [];
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null && params[key] !== '') {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    }
    return parts.join('&');
  }

  // ==================== 公开 API ====================
  return {
    config: config,
    request: request,
    get: get,
    post: post,
    put: put,
    del: del,
    addRequestInterceptor: addRequestInterceptor,
    addResponseInterceptor: addResponseInterceptor,
  };
})();

// ==================== 自动注册拦截器 ====================

// 请求拦截: 自动携带 Token
Request.addRequestInterceptor(function (options) {
  var token = localStorage.getItem('token');
  if (token) {
    options.headers['Authorization'] = 'Bearer ' + token;
  }
  return options;
});

// 响应拦截: 401 自动跳转登录
Request.addResponseInterceptor(function (data, status) {
  if (status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('login.html')) {
      alert('登录已过期，请重新登录');
      window.location.href = 'login.html';
    }
  }
  return data;
});

// 响应拦截: 后端不可用时自动切换 Mock 模式
Request.addResponseInterceptor(function (data, status) {
  if (status === 0 || (data && data.code === 0 && data.message && data.message.indexOf('网络错误') !== -1)) {
    if (!Request.config.useMock) {
      console.warn('[Request] 后端不可用，自动切换到 Mock 模式');
      Request.config.useMock = true;
    }
  }
  return data;
});
