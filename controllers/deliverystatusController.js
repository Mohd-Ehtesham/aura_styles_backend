const Deliverystatus = require("../models/deliverystatusSchema");

function createNewDeliveryStatus(request, response) {
  const userId = request.user.id;
  const { orderId, currentLocation } = request.body;
  if (!orderId) {
    return response
      .status(400)
      .send({ success: false, message: "order id required" });
  }
  if (!currentLocation) {
    return response
      .status(400)
      .send({ success: false, message: "currentLocation id required" });
  }
  Deliverystatus.create({ user: userId, orderId, currentLocation })
    .then((deliveryStatus) => {
      return response.status(201).send({
        success: true,
        message: "deliveryStatus is created",
        data: deliveryStatus,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "deliveryStatus is not created",
        error,
      });
    });
}

function getDeliveryStatusByOrderId(request, response) {
  const orderId = request.params.orderId;
  Deliverystatus.findOne({ orderId })
    .then((orderedDelivery) => {
      if (!orderedDelivery) {
        return response.status(404).send({
          success: false,
          message: "No delivery status found for this orderId",
        });
      }
      return response.status(200).send({
        success: true,
        message: "order deliverey status fetched successfully",
        data: orderedDelivery,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "some error occuring in fetching the deliverey status",
        error,
      });
    });
}

function updateDeliveryLocation(request, response) {
  const orderId = request.params.orderId;
  const currentLocation = request.body.currentLocation;
  if (!orderId) {
    return response.status(400).send({
      success: false,
      message: "Order ID is required.",
    });
  }
  if (
    !currentLocation ||
    typeof currentLocation.latitude !== "number" ||
    typeof currentLocation.latitude !== "number"
  ) {
    return response.status(400).send({
      success: false,
      message: "Valid currentLocation with latitude and longitude is required.",
    });
  }
  Deliverystatus.findOneAndUpdate(
    { orderId },
    { currentLocation },
    { new: true }
  )
    .then((updatedDeliveryCurrentLocation) => {
      if (!updatedDeliveryCurrentLocation) {
        return response.status(404).send({
          success: false,
          message:
            "Delivery current location not found for the given order ID.",
        });
      }
      return response.status(200).send({
        success: true,
        message: "Delivery location updated successfully.",
        data: updatedDeliveryCurrentLocation,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error while updating delivery location.",
        error: error.message,
      });
    });
}

function updateDeliveryStatus(request, response) {
  const orderId = request.params.orderId;
  const status = request.body.status;
  if (!orderId) {
    return response.status(400).send({
      success: false,
      message: "Order ID is required.",
    });
  }
  Deliverystatus.findOneAndUpdate({ orderId }, { status }, { new: true })
    .then((updatedDeliveryStatus) => {
      if (!updatedDeliveryStatus) {
        return response.status(404).send({
          success: false,
          message: "Delivery status not found for the given order ID.",
        });
      }
      return response.status(200).send({
        success: true,
        message: "Delivery status updated successfully.",
        data: updatedDeliveryStatus,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error while updating delivery status.",
        error: error.message,
      });
    });
}

function getAllDeliveryStatuses(request, response) {
  Deliverystatus.find({})
    .then((allDeliveryStatus) => {
      if (allDeliveryStatus.length === 0) {
        return response
          .status(404)
          .send({ success: false, message: "no delivery statuses are found" });
      }
      return response.status(200).send({
        success: true,
        length: allDeliveryStatus.length,
        message: "All delivery statuses are fetched successfully",
        data: allDeliveryStatus,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error while fetching all delivery statuses.",
        error: error.message,
      });
    });
}

module.exports = {
  createNewDeliveryStatus,
  getDeliveryStatusByOrderId,
  updateDeliveryLocation,
  updateDeliveryStatus,
  getAllDeliveryStatuses,
};
