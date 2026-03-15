require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/images", express.static(path.join(__dirname, "public/images")));

/* =========================
   MONGODB CONNECT
========================= */

async function startServer() {
  try {

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB подключена");
    console.log("📌 Database:", mongoose.connection.name);

    const PORT = process.env.PORT || 10000;

    app.listen(PORT, () => {
      console.log("🚀 Server started on port " + PORT);
    });

  } catch (err) {

    console.error("❌ MongoDB CONNECTION ERROR");
    console.error(err);

    process.exit(1);
  }
}

startServer();

/* =========================
   REGISTER
========================= */

app.post("/api/register", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Нет данных" });
    }

    const exist = await User.findOne({ email });

    if (exist) {
      return res.status(400).json({ message: "Email уже существует" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      role: "user"
    });

    res.json({
      message: "Регистрация успешна",
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {

    console.log("REGISTER ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

/* =========================
   LOGIN
========================= */

app.post("/api/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Нет данных" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Нет пользователя" });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Вход выполнен",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {

    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

/* =========================
   ROUTES
========================= */

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

/* =========================
   SAFE FALLBACK
========================= */

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});