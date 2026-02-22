const form = document.getElementById("checkoutForm");
const summary = document.getElementById("summary");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
cart = cart.filter(i => i.selected);

loadSummary();

async function loadSummary() {

  let total = 0;

  for (const item of cart) {
    const res = await fetch("/api/products/" + item.id);
    if (!res.ok) continue;

    const p = await res.json();
    total += p.price * Number(item.qty);
  }

  summary.innerText = "Итого: " + total + " $";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Нужно войти");
    return;
  }

  const items = [];

  for (const item of cart) {
    const res = await fetch("/api/products/" + item.id);
    if (!res.ok) continue;

    const p = await res.json();

    const q = Number(item.qty) || 1;

    items.push({
      product: p._id,
      name: p.name,
      price: p.price,

      // ✅ для orderRoutes.js
      qty: q,

      // ✅ для Order mongoose schema
      quantity: q
    });
  }

  const totalPrice = items.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  const body = {
    items,
    totalPrice,
    customerName: document.getElementById("name").value,
    company: document.getElementById("company").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    comment: document.getElementById("comment").value
  };

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.message || "Ошибка заказа");
    return;
  }

  alert("Заказ успешно оформлен!");

  let fullCart = JSON.parse(localStorage.getItem("cart")) || [];
  fullCart = fullCart.filter(i => !i.selected);
  localStorage.setItem("cart", JSON.stringify(fullCart));

  window.location.href = "/";
});