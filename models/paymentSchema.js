const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "User is required for the payment"],
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Orders",
    required: [true, "Order reference is required"],
  },
  provider: {
    type: String,
    required: [true, "Payment provider is required"],
    enum: {
      values: ["Razorpay", "Stripe", "PayPal", "Cash"],
      message: "Provider must be one of Razorpay, Stripe, PayPal, or Cash",
    },
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [1, "Payment amount must be at least 1"],
  },
  status: {
    type: String,
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
  },
  paymentDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payments", paymentSchema);
