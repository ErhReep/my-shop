const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, adminOnly } = require("../middleware/auth");
const multer = require("multer");
const mongoose = require("mongoose");

/* =========================
   MULTER CONFIG
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Только изображения"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* ===================================================== */
/* ================= CREATE PRODUCT ==================== */
/* ===================================================== */

router.post("/", auth, adminOnly, upload.single("image"), async (req, res) => {
  try {

    let { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Заполните все поля" });
    }

    price = Number(price);
    stock = Number(stock ?? 0);

    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: "Некорректная цена" });
    }

    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: "Некорректный склад" });
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price,
      category,
      stock,
      image: req.file ? `/images/${req.file.filename}` : null
    });

    await product.save();

    res.status(201).json(product);

  } catch (err) {
    console.log("CREATE ERROR:", err);
    res.status(500).json({ message: "Ошибка создания" });
  }
});

/* ===================================================== */
/* ============ GET ALL (FILTER + SEARCH + SORT) ====== */
/* ===================================================== */

router.get("/", async (req, res) => {
  try {

    const { category, search, sort } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    let sortOption = { createdAt: -1 };

    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const products = await Product.find(filter).sort(sortOption);

    res.json(products);

  } catch (err) {
    console.log("GET ALL ERROR:", err);
    res.status(500).json({ message: "Ошибка получения" });
  }
});

/* ===================================================== */
/* ================= GET ONE PRODUCT =================== */
/* ===================================================== */

router.get("/:id", async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Некорректный ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.json(product);

  } catch (err) {
    console.log("GET ONE ERROR:", err);
    res.status(500).json({ message: "Ошибка получения" });
  }
});

/* ===================================================== */
/* ================= UPDATE PRODUCT ==================== */
/* ===================================================== */

router.put("/:id", auth, adminOnly, upload.single("image"), async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Некорректный ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    let { name, description, price, category, stock } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();

    if (price !== undefined) {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ message: "Некорректная цена" });
      }
      product.price = priceNum;
    }

    if (stock !== undefined) {
      const stockNum = Number(stock);
      if (isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({ message: "Некорректный склад" });
      }
      product.stock = stockNum;
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (req.file) {
      product.image = `/images/${req.file.filename}`;
    }

    await product.save();

    res.json(product);

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Ошибка обновления" });
  }
});

/* ===================================================== */
/* ================= DELETE PRODUCT ==================== */
/* ===================================================== */

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Некорректный ID" });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.json({ message: "Товар удалён" });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: "Ошибка удаления" });
  }
});

module.exports = router;