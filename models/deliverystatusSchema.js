const mongoose = require("mongoose");

const deliverystatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User refrence is required for the payment"],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orders",
      required: [true, "Order refrence is required for the payment"],
    },
    currentLocation: {
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
    status: {
      type: String,
      enum: ["Pending", "Out For Delivery", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deliverystatus", deliverystatusSchema);
