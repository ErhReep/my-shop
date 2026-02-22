const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || user.role !== "admin") {
  alert(window.t?.no_access || "Нет доступа");
  location.href = "/login.html";
}

let deleteId = null;

async function loadProducts() {
  try {
    const search = document.getElementById("searchInput").value.trim();
    const category = document.getElementById("categoryFilter").value;

    let query = [];
    if (search) query.push(`search=${encodeURIComponent(search)}`);
    if (category) query.push(`category=${category}`);

    const url = "/api/products" + (query.length ? `?${query.join("&")}` : "");

    const res = await fetch(url);
    const products = await res.json();

    renderProducts(products);

  } catch (err) {
    console.error("LOAD ERROR:", err);
  }
}

function renderProducts(products) {
  const table = document.getElementById("productsTable");
  table.innerHTML = "";

  if (!products.length) {
    table.innerHTML = `<tr><td colspan="6">${window.t?.no_products || "Товары не найдены"}</td></tr>`;
    return;
  }

  products.forEach(product => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        ${product.image ? `<img src="${product.image}" />` : "—"}
      </td>
      <td>${product.name}</td>
      <td>$${product.price}</td>
      <td>
        <input 
          type="number" 
          min="0" 
          value="${product.stock}" 
          class="stock-input"
          onchange="updateStock('${product._id}', this.value)"
        >
      </td>
      <td>${product.category}</td>
      <td>
        <div class="admin-actions">
          <button class="admin-btn btn-edit" onclick="editProduct('${product._id}')">
            ${window.t?.edit || "Edit"}
          </button>
          <button class="admin-btn btn-delete" onclick="openDeleteModal('${product._id}')">
            ${window.t?.delete || "Delete"}
          </button>
        </div>
      </td>
    `;

    table.appendChild(row);
  });
}

async function updateStock(id, newStock) {
  const stock = Number(newStock);

  if (isNaN(stock) || stock < 0) {
    alert(window.t?.invalid_stock || "Некорректное значение склада");
    loadProducts();
    return;
  }

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ stock })
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || window.t?.update_error || "Ошибка обновления");
      loadProducts();
    }

  } catch (err) {
    console.error("UPDATE STOCK ERROR:", err);
  }
}

function editProduct(id) {
  window.location.href = `/admin-edit-product.html?id=${id}`;
}

function openDeleteModal(id) {
  deleteId = id;
  document.getElementById("deleteModal").style.display = "flex";
}

function closeModal() {
  deleteId = null;
  document.getElementById("deleteModal").style.display = "none";
}

document.getElementById("confirmDelete").addEventListener("click", async () => {
  if (!deleteId) return;

  try {
    const res = await fetch(`/api/products/${deleteId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || window.t?.delete_error || "Ошибка удаления");
      return;
    }

    closeModal();
    loadProducts();

  } catch (err) {
    console.error("DELETE ERROR:", err);
  }
});

loadProducts();
