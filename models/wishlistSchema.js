const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User is required for the payment"],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: [true, "Product is required for the payment"],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlists", wishlistSchema);
