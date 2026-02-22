const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  /* ===== ДАННЫЕ КЛИЕНТА ===== */

  customerName: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  company: {
    type: String
  },

  address: {
    type: String,
    required: true
  },

  comment: {
    type: String
  },

  /* ===== ТОВАРЫ ===== */

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },

      name: {
        type: String,
        required: true
      },

      price: {
        type: Number,
        required: true
      },

      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],

  totalPrice: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
