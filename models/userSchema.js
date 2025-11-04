const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    avatar: { type: String },
    name: {
      type: String,
      required: [true, "User Name is Required..."],
      minLength: [3, "User name must be 3 letter or more than 3 letter"],
    },
    email: {
      type: String,
      required: [true, "email is required..."],
      unique: true,
      match: [/\S+@\S+\.\S+/, "email format is invalid"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password must be 6 digits or more than 6 digits"],
    },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    phone: {
      type: String,
      match: [/^\d{10}$/, "phone code must be 10 digits"],
    },
    street: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: {
      type: String,
      match: [/^\d{6}$/, "Postal code must be 6 digits"],
    },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String },
    facebookId: { type: String },
    provider: { type: String, enum: ["google", "facebook", null] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", userSchema);
