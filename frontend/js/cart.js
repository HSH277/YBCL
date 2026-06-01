/**
 * 购物车模块 (用于 cart.html)
 *
 * 功能：
 * 1. 购物车列表展示
 * 2. 数量修改 (含库存校验)
 * 3. 删除商品
 * 4. 结算下单
 */

async function loadCart() {
  const container = document.getElementById('cartContent');
  container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">加载中...</div>';

  const res = await api.getCart();
  if (res.code !== 200 || res.data.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="icon">🛒</div>
        <p>购物车是空的</p>
        <a href="index.html" style="color:var(--primary);">去逛逛</a>
      </div>`;
    document.getElementById('cartSummary').style.display = 'none';
    return;
  }

  let total = 0;
  container.innerHTML = `
    <div class="cart-table">
      <table>
        <thead>
          <tr><th>商品</th><th>单价</th><th>数量</th><th>小计</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${res.data.map(item => {
            const subtotal = Number(item.price) * item.quantity;
            total += subtotal;
            return `
              <tr data-id="${item.id}">
                <td>
                  <strong>${item.name}</strong>
                  ${item.stock < 10 ? '<span class="badge badge-danger" style="margin-left:8px;">库存紧张</span>' : ''}
                </td>
                <td>¥${Number(item.price).toFixed(2)}</td>
                <td>
                  <input type="number" class="qty-input" value="${item.quantity}" min="1" max="${item.stock}"
                    onchange="updateQty(${item.id}, this.value)" style="width:70px;">
                </td>
                <td>¥${subtotal.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeItem(${item.id})">删除</button></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('totalAmount').textContent = '¥' + total.toFixed(2);
  document.getElementById('cartSummary').style.display = '';
}

async function updateQty(cartId, qty) {
  const num = parseInt(qty);
  if (isNaN(num) || num < 1) {
    alert('数量不合法');
    loadCart();
    return;
  }
  const res = await api.updateCartItem(cartId, { quantity: num });
  if (res.code === 200) {
    loadCart();
  } else {
    alert(res.message);
    loadCart();
  }
}

async function removeItem(cartId) {
  if (!confirm('确定要移除该商品吗？')) return;
  await api.removeCartItem(cartId);
  loadCart();
}

async function checkout() {
  if (!confirm('确认提交订单吗？')) return;
  const btn = document.getElementById('btnCheckout');
  btn.disabled = true;
  btn.textContent = '提交中...';

  const res = await api.createOrder();
  if (res.code === 200) {
    alert('下单成功！订单号：' + res.data.order_id);
    window.location.href = 'orders.html';
  } else {
    alert(res.message);
    btn.disabled = false;
    btn.textContent = '去结算';
  }
}

/** 页面初始化: 登录守卫 + 加载购物车 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!await requireAuth()) return;
  loadCart();
});
