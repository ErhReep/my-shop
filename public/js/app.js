const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
const role = user?.role || null;

const productsDiv = document.getElementById("products");
let debounceTimer;

/* ===== i18n HELPER ===== */

function t(key) {
  const lang = localStorage.getItem("lang") || "ru";
  return window.translations?.[lang]?.[key] || key;
}

/* ===== ЗАГРУЗКА ТОВАРОВ ===== */

async function loadProducts() {

  const category = document.getElementById("categorySelect")?.value;
  const search = document.getElementById("searchInput")?.value;
  const sort = document.getElementById("sortSelect")?.value;

  let url = "/api/products?";
  let params = [];

  if (category) params.push("category=" + category);
  if (search) params.push("search=" + search);
  if (sort) params.push("sort=" + sort);

  url += params.join("&");

  try {

    const res = await fetch(url);
    const products = await res.json();

    productsDiv.innerHTML = "";

    if (!products.length) {
      productsDiv.innerHTML = `
        <p class="no-products" data-i18n="no_products"></p>
      `;
      applyTranslations(localStorage.getItem("lang") || "ru");
      return;
    }

    products.forEach(p => {

      const div = document.createElement("div");
      div.className = "product";

      div.innerHTML = `
        <div class="price-badge">$${p.price}</div>

        <img src="${p.image}" onclick="openProduct('${p._id}')" style="cursor:pointer;" />

        <h3>${p.name}</h3>
        <p>${p.description}</p>

        <p class="category-label">
          <span data-i18n="category_label"></span>: ${p.category}
        </p>

        <button onclick="addToCart('${p._id}')" data-i18n="add_to_cart"></button>
      `;

      if (role === "admin") {
        div.innerHTML += `
          <button class="admin-btn" onclick="deleteProduct('${p._id}')" data-i18n="delete"></button>
          <button class="admin-btn" onclick="openEdit('${p._id}','${escapeQuotes(p.name)}','${escapeQuotes(p.description)}','${p.price}')" data-i18n="edit"></button>
        `;
      }

      productsDiv.appendChild(div);
    });

    if (window.applyTranslations) {
      applyTranslations(localStorage.getItem("lang") || "ru");
    }

  } catch (err) {
    console.error(err);
    alert(t("load_products_error"));
  }
}

/* ===== SAFE STRING ESCAPE ===== */

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/* ===== ОТКРЫТИЕ ТОВАРА ===== */

function openProduct(id) {
  window.location.href = "/product.html?id=" + id;
}

/* ===== LIVE SEARCH ===== */

function initFilters() {

  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const sortSelect = document.getElementById("sortSelect");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadProducts, 400);
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", loadProducts);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", loadProducts);
  }
}

/* ===== КОРЗИНА ===== */

function addToCart(id) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const found = cart.find(i => i.id === id);

  if (found) {
    found.qty += 1;
  } else {
    cart.push({ id, qty: 1, selected: true });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert(t("cart_added"));
}

/* ===== DELETE ===== */

async function deleteProduct(id) {

  if (!token) {
    alert(t("no_token"));
    return;
  }

  if (!confirm(t("confirm_delete"))) return;

  try {

    const res = await fetch("/api/products/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) throw new Error();

    loadProducts();

  } catch {
    alert(t("delete_error"));
  }
}

/* ===== EDIT ===== */

let editId = null;

function openEdit(id, name, description, price) {
  editId = id;

  document.getElementById("editName").value = name;
  document.getElementById("editDescription").value = description;
  document.getElementById("editPrice").value = price;

  document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

async function saveEdit() {

  const name = document.getElementById("editName").value;
  const description = document.getElementById("editDescription").value;
  const price = document.getElementById("editPrice").value;

  try {

    const res = await fetch("/api/products/" + editId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name, description, price })
    });

    if (!res.ok) throw new Error();

    closeModal();
    loadProducts();

  } catch {
    alert(t("save_error"));
  }
}

/* ===== СТАРТ ===== */

document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  loadProducts();
});
