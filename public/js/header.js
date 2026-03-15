/* =========================
LOAD HEADER
========================= */

document.addEventListener("DOMContentLoaded", () => {
loadHeader();
});

async function loadHeader() {
try {

```
const res = await fetch("/header.html");
const html = await res.text();

const container = document.getElementById("header-container");
if (!container) return;

container.innerHTML = html;

initHeader();
initLanguage();
```

} catch (err) {
console.error("Header load error:", err);
}
}

/* =========================
INIT HEADER
========================= */

function initHeader() {

updateCartCount();

const token = localStorage.getItem("token");

let user = null;
try {
user = JSON.parse(localStorage.getItem("user"));
} catch {
user = null;
}

const loginLink = document.getElementById("login-link");
const registerLink = document.getElementById("register-link");
const logoutLink = document.getElementById("logout-link");
const adminLink = document.getElementById("admin-link");

const profileMenu = document.getElementById("profileMenu");
const profileName = document.getElementById("profileName");
const profileDropdown = document.getElementById("profileDropdown");

/* ===== AUTH UI ===== */

if (token && user) {

```
if (loginLink) loginLink.style.display = "none";
if (registerLink) registerLink.style.display = "none";

if (profileMenu) profileMenu.style.display = "flex";

if (profileName) {
  profileName.innerText =
    user.email ||
    user.username ||
    "User";
}

if (user.role === "admin" && adminLink) {
  adminLink.style.display = "inline";
}
```

} else {

```
if (loginLink) loginLink.style.display = "inline";
if (registerLink) registerLink.style.display = "inline";

if (profileMenu) profileMenu.style.display = "none";
if (adminLink) adminLink.style.display = "none";
```

}

/* =========================
PROFILE DROPDOWN
========================= */

if (profileName && profileDropdown && profileMenu) {

```
profileName.addEventListener("click", (e) => {

  e.stopPropagation();

  profileDropdown.classList.toggle("open");

});

document.addEventListener("click", (e) => {

  if (!profileMenu.contains(e.target)) {

    profileDropdown.classList.remove("open");

  }

});
```

}

/* ===== LOGOUT ===== */

if (logoutLink) {

```
logoutLink.addEventListener("click", (e) => {

  e.preventDefault();

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.reload();

});
```

}

/* ===== BURGER MENU ===== */

const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

if (burger && navLinks) {

```
burger.addEventListener("click", () => {

  navLinks.classList.toggle("active");

});
```

}

}

/* =========================
LANGUAGE SYSTEM
========================= */

function initLanguage() {

const languageSwitcher = document.getElementById("language-switcher");
if (!languageSwitcher) return;

const savedLang = localStorage.getItem("lang") || "cs";

languageSwitcher.value = savedLang;

languageSwitcher.addEventListener("change", (e) => {

```
const selectedLang = e.target.value;

localStorage.setItem("lang", selectedLang);

if (window.applyTranslations) {
  window.applyTranslations(selectedLang);
}
```

});

if (window.applyTranslations) {
window.applyTranslations(savedLang);
}

}

/* =========================
CART COUNT
========================= */

function updateCartCount() {

const cart = JSON.parse(localStorage.getItem("cart")) || [];

const totalQty = cart.reduce((sum, item) => {
return sum + (item.qty || 1);
}, 0);

const countEl = document.getElementById("cart-count");

if (countEl) {

```
countEl.innerText = totalQty;

countEl.style.display =
  totalQty > 0
    ? "inline-block"
    : "none";
```

}

}
