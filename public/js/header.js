/* =========================
   LOAD HEADER
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
});

async function loadHeader() {
  try {
    const res = await fetch("/header.html");
    const html = await res.text();

    const container = document.getElementById("header-container");
    if (!container) return;

    container.innerHTML = html;

    initHeader();
    initLanguage();
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
  const user = JSON.parse(localStorage.getItem("user"));

  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link"); // NEW
  const logoutLink = document.getElementById("logout-link");
  const adminLink = document.getElementById("admin-link");
  const profileMenu = document.getElementById("profileMenu");
  const profileName = document.getElementById("profileName");

  /* ===== AUTH UI ===== */

  if (token && user) {

    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none"; // NEW
    if (profileMenu) profileMenu.style.display = "block";

    if (profileName) {
      profileName.innerText = user.username || "";
    }

    if (user.role === "admin" && adminLink) {
      adminLink.style.display = "inline";
    }

  } else {

    if (loginLink) loginLink.style.display = "inline";
    if (registerLink) registerLink.style.display = "inline"; // NEW
    if (profileMenu) profileMenu.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
  }

  /* ===== LOGOUT ===== */

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/";
    });
  }

  /* ===== BURGER MENU ===== */

  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }
}

/* =========================
   LANGUAGE SYSTEM (CENTRALIZED)
========================= */

function initLanguage() {

  const languageSwitcher = document.getElementById("language-switcher");
  if (!languageSwitcher) return;

  const savedLang = localStorage.getItem("lang") || "cs";

  languageSwitcher.value = savedLang;

  languageSwitcher.addEventListener("change", (e) => {

    const selectedLang = e.target.value;

    localStorage.setItem("lang", selectedLang);

    if (window.applyTranslations) {
      window.applyTranslations(selectedLang);
    }

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

  let totalQty = 0;

  cart.forEach(item => {
    totalQty += item.qty || 1;
  });

  const countEl = document.getElementById("cart-count");

  if (countEl) {
    countEl.innerText = totalQty;
    countEl.style.display = totalQty > 0 ? "inline-block" : "none";
  }
}