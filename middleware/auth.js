const jwt = require("jsonwebtoken");

/* ===============================
   AUTH MIDDLEWARE (любой пользователь)
================================ */

function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "Нет токена" });
    }

    // формат: Bearer TOKEN
    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Нет токена" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (err) {
    console.log("JWT ERROR:", err.message);
    res.status(401).json({ message: "Неверный токен" });
  }
}

/* ===============================
   ADMIN ONLY
================================ */

function adminOnly(req, res, next) {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Не авторизован" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Нет доступа" });
    }

    next();

  } catch (err) {
    res.status(500).json({ message: "Ошибка доступа" });
  }
}

module.exports = {
  auth,
  adminOnly
};
