const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User is required for the review"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: [true, "Product is required for the review"],
    },
    images: [{ url: { type: String }, fileId: { type: String } }],
    reviewRating: {
      type: Number,
      required: [true, "rating is required"],
      min: 0,
      max: 5,
    },
    comment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reviews", reviewSchema);
