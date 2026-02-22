const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  image: {
    type: String
  },

  category: {
    type: String,
    enum: ["tables", "chairs"],
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
