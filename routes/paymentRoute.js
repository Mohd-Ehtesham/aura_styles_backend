const express = require("express");
const router = express.Router();

const {
  createNewPayment,
  verifyPayment,
  getUserPayments,
  getSpecificOrderPayment,
  updatePaymentStatus,
  getAllPayments,
} = require("../controllers/paymentController");

// authentication middleware for getting userIda
const authMiddleware = require("../middlewares/authMiddleware");

// route for creating new payment
router.post("/registerPayment/:_id", authMiddleware, createNewPayment);

// route for verifying payment
router.post("/verify", verifyPayment);

// route for getting all payments of a user
router.get("/userPayments", authMiddleware, getUserPayments);

// route for getting specific order payment
router.get(
  "/getSpecificOrderPayment/:_id",
  authMiddleware,
  getSpecificOrderPayment
);

// route for updating paymentStatus
router.put("/updatePaymentStatus/:_id", updatePaymentStatus);

// route for getting all Payments
router.get("/allPayments", getAllPayments);

module.exports = router;
