const express = require("express");
const router = express.Router();

const {
  createNewReview,
  getAllReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

// authentication middleware for getting userId
const authMiddleware = require("../middlewares/authMiddleware");

// middleware for uploading the product images
const productImagesUploadMiddleware = require("../middlewares/productImagesUploadMiddleware");

// route for creating new Review
router.post(
  "/registerReview",
  authMiddleware,
  productImagesUploadMiddleware.array("images", 7),
  createNewReview
);

// route for getting all Reviews
router.get("/allReviews", getAllReviews);

// router for updating specific review
router.put(
  "/updateReview/:reviewId",
  productImagesUploadMiddleware.array("images", 7),
  updateReview
);

// router for deleting the specific review
router.delete("/deleteReview/:reviewId", deleteReview);

module.exports = router;
