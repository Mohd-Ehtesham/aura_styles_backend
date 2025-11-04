const express = require("express");
const router = express.Router();

const {
  createNewOrder,
  getUserOrders,
  getOrderById,
  updateOrderPaymentToPaid,
  updateOrderToDelivered,
  getAllOrders,
  deleteOrder,
  getOrderSummaryStats,
} = require("../controllers/orderController");

// authentication middleware for getting userIda
const authMiddleware = require("../middlewares/authMiddleware");

// middleware for geocoding address to lat long
const geocodeMiddleware = require("../middlewares/geocodeMiddleware");

// route for creating new order
router.post(
  "/registerOrder",
  authMiddleware,
  geocodeMiddleware,
  createNewOrder
);

// route for fetching all orders of specific user
router.get("/getUserOrders", authMiddleware, getUserOrders);

// route for fetching specific order
router.get("/order/:_id", authMiddleware, getOrderById);

// route for updating order paymentStatus for specific order
router.put(
  "/updatingOrderPaymentStatus/:_id",
  authMiddleware,
  updateOrderPaymentToPaid
);

// route for updating order deliveryStatus for specific order
router.put(
  "/updatingOrderDeliveryStatus/:_id",
  authMiddleware,
  updateOrderToDelivered
);

// route for fetching all orders
router.get("/allOrders", getAllOrders);

// route for deleting the order
router.delete("/deleteOrder/:_id", authMiddleware, deleteOrder);

// route for getting stats of orders
router.get("/orderStats", getOrderSummaryStats);

module.exports = router;
