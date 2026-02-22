const API_URL = "/api/products";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const imageEl = document.getElementById("product-image");
const titleEl = document.getElementById("product-title");
const categoryEl = document.getElementById("product-category");
const priceEl = document.getElementById("product-price");
const descriptionEl = document.getElementById("product-description");

const relatedContainer = document.getElementById("related-products");

const addToCartBtn = document.getElementById("add-to-cart");
const buyNowBtn = document.getElementById("buy-now");

let currentProduct = null;

// ================= LOAD PRODUCT =================

async function loadProduct() {
  if (!productId) return;

  try {
    const res = await fetch(`${API_URL}/${productId}`);
    const product = await res.json();

    currentProduct = product;

    imageEl.src = product.image;
    titleEl.textContent = product.name;
    categoryEl.textContent = product.category;
    priceEl.textContent = "$" + product.price;
    descriptionEl.textContent = product.description;

    loadRelated(product.category);

    if (typeof applyTranslations === "function") {
      applyTranslations(localStorage.getItem("lang") || "ru");
    }

  } catch (err) {
    console.error("Product load error:", err);
  }
}

// ================= RELATED =================

async function loadRelated(category) {
  try {
    const res = await fetch(`${API_URL}?category=${category}`);
    const products = await res.json();

    relatedContainer.innerHTML = "";

    products
      .filter(p => p._id !== productId)
      .slice(0, 4)
      .forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
          <img src="${product.image}" />
          <h3>${product.name}</h3>
          <p>$${product.price}</p>
        `;

        card.onclick = () => {
          window.location.href = `product.html?id=${product._id}`;
        };

        relatedContainer.appendChild(card);
      });

  } catch (err) {
    console.error("Related load error:", err);
  }
}

// ================= CART =================

if (addToCartBtn) {
  addToCartBtn.addEventListener("click", () => {

    if (!currentProduct) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === currentProduct._id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: currentProduct._id,
        qty: 1,
        selected: true
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    if (typeof showAlert === "function") {
      showAlert("added_to_cart");
    } else {
      alert("Added to cart");
    }
  });
}

// ================= BUY NOW =================

if (buyNowBtn) {
  buyNowBtn.addEventListener("click", () => {

    if (!currentProduct) return;

    let cart = [{
      id: currentProduct._id,
      qty: 1,
      selected: true
    }];

    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "checkout.html";
  });
}

loadProduct();
