const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      minLength: [
        3,
        "Product name is minimum of 3 characters longs or more than 3 characters...",
      ],
      unique: true,
    },
    brand: { type: String },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minLength: [
        10,
        "Product description is minimum of 10 characters longs or more than 10 characters...",
      ],
    },
    category: {
      type: String,
      enum: ["Indian", "Pakistani"],
      required: [true, "category is required"],
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price cannot be negative number"],
    },
    discountPrice: { type: Number, required: true },
    sizes: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL"],
        required: [true, "size is required"],
      },
    ],
    stock: {
      type: Number,
      default: 0,
      min: [0, "stock cannot be negative number"],
    },
    images: [
      {
        url: {
          type: String,
          required: [true, "Image URL is required"],
        },
        fileId: {
          type: String,
          required: [true, "ImageKit fileId is required to delete the image"],
        },
      },
      ,
    ],
    isFeatured: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
