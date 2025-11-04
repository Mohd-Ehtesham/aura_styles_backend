const mongoose = require("mongoose");

const adminsettingSchema = new mongoose.Schema({
  bannerImages: [
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
  ],
  offerText: {
    type: String,
    required: [true, "Offer text is required"],
    minlength: [5, "Offer text must be at least 5 characters"],
  },
  contactEmail: {
    type: String,
    required: [true, "email is required..."],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "email format is invalid"],
  },
  contactPhone: {
    type: String,
    required: [true, "contact number is required"],
    match: [/^\d{10}$/, "contactPhone code must be 10 digits"],
  },
});

module.exports = mongoose.model("Adminsetting", adminsettingSchema);
