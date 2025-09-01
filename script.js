document.addEventListener('DOMContentLoaded', () => {
  // Load cart from localStorage (or empty array)
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  // Helpers
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;
    const totalQty = cart.reduce((sum, it) => sum + (it.qty || 0), 0);
    countEl.textContent = totalQty;
  }

  // Add-to-cart using event delegation (works for buttons or links)
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return; // not an add-to-cart click

    e.preventDefault();

    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price) || 0;
    const img = btn.dataset.img || '';
    const qty = parseInt(btn.dataset.qty || '1', 10) || 1;

    if (!name) {
      console.warn('add-to-cart element missing data-name:', btn);
      alert('Product data missing — see console.');
      return;
    }

    // merge by name+price
    const existing = cart.find(i => i.name === name && i.price === price);
    if (existing) {
      existing.qty = (existing.qty || 0) + qty;
    } else {
      cart.push({ name, price, img, qty });
    }

    saveCart();

    // feedback + redirect
    alert(`${name} added to cart`);
    window.location.href = 'cart.html'; // redirect to cart
  });

  // CART PAGE: render items, handle remove and quantity changes
  if (window.location.pathname.toLowerCase().includes('cart')) {
    renderCart();
  }

  function renderCart() {
    const tableBody = document.querySelector('#cart-table tbody');
    const totalEl = document.getElementById('total');

    if (!tableBody) return;

    tableBody.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="align-middle">
          <div class="d-flex align-items-center">
            <img src="${item.img || ''}" alt="" style="width:60px;height:45px;object-fit:cover;border-radius:4px">
            <div class="ms-2">${item.name}</div>
          </div>
        </td>
        <td class="align-middle">
          <input type="number" min="1" value="${item.qty}" class="form-control qty-input" data-index="${index}" style="width:80px">
        </td>
        <td class="align-middle">$${(item.price * item.qty).toFixed(2)}</td>
        <td class="align-middle">
          <button class="btn btn-danger btn-sm remove" data-index="${index}">Remove</button>
        </td>
      `;
      tableBody.appendChild(tr);

      total += item.price * item.qty;
    });

    if (totalEl) totalEl.textContent = total.toFixed(2);

    // remove listeners
    tableBody.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        cart.splice(idx, 1);
        saveCart();
        renderCart();
      });
    });

    // qty change listeners
    tableBody.querySelectorAll('.qty-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.dataset.index, 10);
        let v = parseInt(inp.value || '1', 10);
        if (isNaN(v) || v < 1) v = 1;
        cart[idx].qty = v;
        saveCart();
        renderCart();
      });
    });
  }

  // expose for debugging in console if needed
  window._debugCart = { get: () => cart, save: saveCart, render: renderCart };

  // initial update of cart badge
  updateCartCount();
});
