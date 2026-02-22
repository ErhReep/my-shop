const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");

const { auth, adminOnly } = require("../middleware/auth");

const mongoose = require("mongoose");

/* ===================================================== */
/* ================= CREATE ORDER ====================== */
/* ===================================================== */

router.post("/", auth, async (req, res) => {
  try {

    const {
      items,
      customerName,
      phone,
      email,
      company,
      address,
      comment
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Корзина пустая" });
    }

    if (!customerName || !phone || !email || !address) {
      return res.status(400).json({ message: "Заполните обязательные поля" });
    }

    let totalPrice = 0;
    const finalItems = [];

    /* ===== Проверка товаров ===== */

    for (const item of items) {

      const productId = item.product;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Некорректный товар" });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Товар не найден" });
      }

      const qty = Number(item.qty || item.quantity || 1);

      if (qty <= 0) {
        return res.status(400).json({ message: "Некорректное количество" });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          message: `Недостаточно товара: ${product.name}`
        });
      }

      /* ===== списываем склад ===== */

      product.stock -= qty;
      await product.save();

      /* ===== считаем цену ===== */

      totalPrice += product.price * qty;

      /* ===== сохраняем item ===== */

      finalItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty
      });
    }

    /* ===== создаем заказ ===== */

    const order = new Order({
      user: req.user.id,
      customerName,
      phone,
      email,
      company,
      address,
      comment,
      items: finalItems,
      totalPrice,
      status: "pending"
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Заказ создан",
      order
    });

  } catch (err) {
    console.log("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Ошибка создания заказа" });
  }
});


/* ===================================================== */
/* ================= MY ORDERS ========================= */
/* ===================================================== */

router.get("/my", auth, async (req, res) => {
  try {

    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.log("MY ORDERS ERROR:", err);
    res.status(500).json({ message: "Ошибка получения заказов" });
  }
});


/* ===================================================== */
/* =============== ADMIN: GET ALL ORDERS =============== */
/* ===================================================== */

router.get("/", auth, adminOnly, async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "email")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.log("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Ошибка получения заказов" });
  }
});


/* ===================================================== */
/* ============ ADMIN: UPDATE ORDER STATUS ============= */
/* ===================================================== */

router.put("/:id/status", auth, adminOnly, async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "paid", "shipped", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Некорректный статус" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    res.json(order);

  } catch (err) {
    console.log("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: "Ошибка обновления статуса" });
  }
});


module.exports = router;
