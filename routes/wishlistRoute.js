const express = require("express");
const router = express.Router();

const {
  toggleWishlistProduct,
  getUserSpecificWishlist,
  removeProductFromWishlist,
} = require("../controllers/wishlistController");

// auth middleware
const authMiddleware = require("../middlewares/authMiddleware");

// toggle product in wishlist (add/remove)
router.post(
  "/toggleWishlist/:productId",
  authMiddleware,
  toggleWishlistProduct
);

// get current user's wishlist
router.get("/getUserSpecificWishlist", authMiddleware, getUserSpecificWishlist);

// remove product from wishlist
router.delete(
  "/removeProductFromWishlist/:productId",
  authMiddleware,
  removeProductFromWishlist
);

module.exports = router;
