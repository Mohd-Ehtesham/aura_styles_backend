const express = require("express");
const router = express.Router();

const {
  addProductToCart,
  removeProductFromCart,
  showAllCartProducts,
  updateCartQuantity,
  clearCart,
} = require("../controllers/addToCartController");

// middleware for user authentication
const authMiddleware = require("../middlewares/authMiddleware");

// route of adding product to cart
router.post("/addToCart/:productId", authMiddleware, addProductToCart);

// route for getting all products from cart
router.get("/allProductsFromCart", authMiddleware, showAllCartProducts);

// route for updating product quantity in cart
router.put(
  "/updateCartQuantity/:productId",
  authMiddleware,
  updateCartQuantity
);

// route of removing product from cart
router.delete(
  "/removeFromCart/:productId",
  authMiddleware,
  removeProductFromCart
);

// route for clearing the cart
router.delete("/clearCart", authMiddleware, clearCart);

module.exports = router;
