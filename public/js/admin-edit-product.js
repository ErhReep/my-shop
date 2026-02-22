/* =========================
   ADMIN ACCESS CHECK
========================= */

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || user.role !== "admin") {
  alert("Нет доступа");
  location.href = "/login.html";
}

/* =========================
   GET PRODUCT ID
========================= */

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  alert("ID товара не указан");
  window.location.href = "/admin-products.html";
}

/* =========================
   LOAD PRODUCT
========================= */

async function loadProduct() {
  try {
    const res = await fetch(`/api/products/${productId}`);
    const product = await res.json();

    if (!res.ok) {
      alert(product.message || "Ошибка загрузки");
      window.location.href = "/admin-products.html";
      return;
    }

    document.getElementById("name").value = product.name;
    document.getElementById("description").value = product.description;
    document.getElementById("price").value = product.price;
    document.getElementById("stock").value = product.stock;
    document.getElementById("category").value = product.category;

    if (product.image) {
      document.getElementById("previewImage").src = product.image;
    }

  } catch (err) {
    console.error("LOAD PRODUCT ERROR:", err);
  }
}

/* =========================
   IMAGE PREVIEW
========================= */

document.getElementById("image").addEventListener("change", function() {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById("previewImage").src = e.target.result;
  };
  reader.readAsDataURL(file);
});

/* =========================
   UPDATE PRODUCT
========================= */

async function updateProduct() {

  const formData = new FormData();

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = document.getElementById("price").value;
  const stock = document.getElementById("stock").value;
  const category = document.getElementById("category").value;

  if (!name || !description || price === "" || stock === "") {
    alert("Заполните все поля");
    return;
  }

  formData.append("name", name);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("stock", stock);
  formData.append("category", category);

  const imageFile = document.getElementById("image").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {

    const res = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Ошибка обновления");
      return;
    }

    alert("✅ Товар обновлён");
    window.location.href = "/admin-products.html";

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    alert("Ошибка сервера");
  }
}

/* =========================
   BACK
========================= */

function goBack() {
  window.location.href = "/admin-products.html";
}

/* =========================
   INIT
========================= */

loadProduct();
