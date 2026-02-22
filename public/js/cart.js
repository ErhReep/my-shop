const cartDiv = document.getElementById("cart");
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ===== INIT ===== */

cart = cart.map(item => ({
  ...item,
  qty: item.qty || 1,
  selected: item.selected !== false
}));

saveCart();
loadCart();
updateCartCountSafe();

/* ===== SAVE ===== */

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ===== SAFE COUNT UPDATE ===== */

function updateCartCountSafe() {
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }
}

/* ===== LOAD CART ===== */

async function loadCart() {
  cartDiv.innerHTML = "";
  let total = 0;

  for (let index = 0; index < cart.length; index++) {
    const item = cart[index];

    const res = await fetch("/api/products/" + item.id);
    if (!res.ok) continue;

    const p = await res.json();

    if (item.selected) {
      total += p.price * item.qty;
    }

    cartDiv.innerHTML += `
      <div class="cart-item">
        <input type="checkbox" 
               ${item.selected ? "checked" : ""} 
               onchange="toggleSelect(${index})">

        <img src="${p.image}" class="cart-image">

        <div class="cart-info">
          <h3>${p.name}</h3>
          <p>${p.price} $</p>

          <div class="qty-controls">
            <button onclick="changeQty(${index}, -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${index}, 1)">+</button>
          </div>

          <button class="remove-btn" onclick="removeItem(${index})">
            ${window.t?.remove || "Удалить"}
          </button>
        </div>
      </div>
    `;
  }

  document.getElementById("total").innerText =
    (window.t?.cart_total || "Итого:") + " " + total + " $";

  updateCartCountSafe();
}

/* ===== CHANGE QTY ===== */

function changeQty(index, change) {
  cart[index].qty += change;
  if (cart[index].qty < 1) cart[index].qty = 1;

  saveCart();
  loadCart();
  updateCartCountSafe();
}

/* ===== TOGGLE SELECT ===== */

function toggleSelect(index) {
  cart[index].selected = !cart[index].selected;
  saveCart();
  loadCart();
  updateCartCountSafe();
}

/* ===== REMOVE ===== */

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  loadCart();
  updateCartCountSafe();
}

/* ===== CHECKOUT ===== */

function checkout() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert(window.t?.login_required || "Нужно войти");
    return;
  }

  const selectedItems = cart.filter(i => i.selected);

  if (selectedItems.length === 0) {
    alert(window.t?.select_items || "Выберите товары для покупки");
    return;
  }

  localStorage.setItem("checkoutCart", JSON.stringify(selectedItems));
  window.location.href = "/checkout.html";
}
