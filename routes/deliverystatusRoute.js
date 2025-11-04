const express = require("express");
const router = express.Router();

const {
  createNewDeliveryStatus,
  getDeliveryStatusByOrderId,
  updateDeliveryLocation,
  updateDeliveryStatus,
  getAllDeliveryStatuses,
} = require("../controllers/deliverystatusController");

// authentication middleware for getting userId
const authMiddleware = require("../middlewares/authMiddleware");

// route for creating new delivery status
router.post(
  "/registerNewDeliveryStatus",
  authMiddleware,
  createNewDeliveryStatus
);

// route for finding delivery status of specific order
router.get(
  "/deliveryStatusOfSpecificOrder/:orderId",
  getDeliveryStatusByOrderId
);

// route for updating delivery currentLocation
router.put(
  "/updateDeliveryCurrentLocationOfSpecificOrder/:orderId",
  updateDeliveryLocation
);

// route for updating delivery status
router.put(
  "/updateDeliveryStatusOfSpecificOrder/:orderId",
  updateDeliveryStatus
);

// route for fetching all delivery statuses
router.get("/allDeliveryStatuses", getAllDeliveryStatuses);

module.exports = router;
