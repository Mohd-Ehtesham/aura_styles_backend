const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be atleast 1"],
        },
        price: Number,
      },
    ],
    shippingAddress: {
      street: { type: String, required: [true, "street is required"] },
      city: { type: String, required: [true, "city is required"] },
      state: { type: String, required: [true, "state is required"] },
      country: { type: String, required: [true, "country is required"] },
      postalCode: {
        type: String,
        required: true,
        match: [/^\d{6}$/, "Postal code must be 6 digits"],
      },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      required: [true, "payment method is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
      required: true,
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    orderPlacedLocation: {
      latitude: {
        type: Number,
        min: [-90, "latitude must be between -90 and 90"],
        max: [90, "latitude must be between -90 and 90"],
      },
      longitude: {
        type: Number,
        min: [-180, "longitude must be between -180 and 180"],
        max: [180, "longitude must be between -180 and 180"],
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema);
