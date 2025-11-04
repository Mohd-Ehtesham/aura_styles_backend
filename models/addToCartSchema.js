const mongoose = require("mongoose");

const AddToCartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User is required for the payment"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: [true, "Product is required for the payment"],
        },
        size: {
          type: String,
          required: true,
        },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AddToCarts", AddToCartSchema);
