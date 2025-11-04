const crypto = require("crypto");
const razorpay = require("razorpay");
const Orders = require("../models/orderSchema");
const Payments = require("../models/paymentSchema");

require("dotenv").config();

const razorpayInstance = new razorpay({
  key_id: process.env.razorpay_key_id,
  key_secret: process.env.razorpay_key_secret,
});

function createNewPayment(request, response) {
  const userId = request.user.id;
  const orderId = request.params._id;
  const { provider, amount } = request.body;
  if (!orderId || !provider || !amount) {
    return response.status(400).send({
      success: false,
      message: "Order ID, provider, and amount are required.",
    });
  }
  const allowedProviders = ["Razorpay", "Stripe", "PayPal", "Cash"];
  if (!allowedProviders.includes(provider)) {
    return response.status(400).send({
      success: false,
      message: "Invalid payment provider.",
    });
  }
  Orders.findById(orderId)
    .then((existingOrder) => {
      if (!existingOrder) throw new Error("Order not found");
      if (provider === "Razorpay") {
        const options = {
          amount: amount * 100,
          currency: "INR",
          receipt: `receipt_order_${orderId}`,
        };
        return razorpayInstance.orders.create(options).then((razorpayOrder) => {
          return Payments.create({
            user: userId,
            order: orderId,
            provider,
            amount,
            status: "Pending",
            razorpayOrderId: razorpayOrder.id,
          }).then((payment) => {
            response.status(201).send({
              success: true,
              message: "Razorpay order created successfully.",
              order: razorpayOrder,
              payment,
            });
          });
        });
      }
      return Payments.create({
        user: userId,
        order: orderId,
        provider,
        amount,
        status: "Pending",
      }).then((payment) => {
        response.status(201).send({
          success: true,
          message: "Payment created successfully.",
          data: payment,
        });
      });
    })
    .catch((error) => {
      console.error("Error in createNewPayment:", error);
      response.status(500).send({
        success: false,
        message: "Error occurred while creating payment.",
        error: error.message,
      });
    });
}

function verifyPayment(request, response) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    request.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return response.status(400).send({
      success: false,
      message: "Missing payment details.",
    });
  }
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.razorpay_key_secret)
    .update(body.toString())
    .digest("hex");
  if (expectedSignature === razorpay_signature) {
    Payments.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, status: "Success" },
      { new: true }
    )
      .then((updatedPayment) => {
        return response.status(200).send({
          success: true,
          message: "Payment verified successfully.",
          data: updatedPayment,
        });
      })
      .catch((error) => {
        return response.status(500).send({
          success: false,
          message: "Error updating payment status.",
          error,
        });
      });
  } else {
    Payments.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
      },
      { status: "Failed" },
      { new: true }
    )
      .then((updatedPayment) => {
        return response.status(400).send({
          success: false,
          message: "Invalid signature, payment verification failed.",
          data: updatedPayment,
        });
      })
      .catch((error) => {
        return response.status(500).send({
          success: false,
          message: "Error updating payment status.",
          error,
        });
      });
  }
}

function getUserPayments(request, response) {
  const userId = request.user.id;
  Payments.find({ user: userId })
    .populate("user")
    .populate("order", "orderItems paymentMethod isDelivered")
    .then((allPayments) => {
      if (!allPayments || allPayments.length === 0) {
        return response.status(400).send({
          success: false,
          message: "There is no payment details for user",
        });
      }
      return response.status(200).send({
        success: true,
        length: allPayments.length,
        message: "Payment details is fetched successfully for user",
        data: allPayments,
      });
    })
    .catch((error) => {
      return response.status(200).send({
        success: false,
        message: "Error occured in fetching payment details for user",
        error,
      });
    });
}

function getSpecificOrderPayment(request, response) {
  const orderId = request.params._id;
  Payments.findOne({ order: orderId })
    .populate("user", "name")
    .populate("order", "orderItems paymentMethod isDelivered")
    .then((payment) => {
      if (!payment) {
        return response.status(404).send({
          success: false,
          message: "No payment of this order as there is no order.",
        });
      }
      return response.status(200).send({
        success: true,
        message: "Payment details is fetched successfully for this order",
        data: payment,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message:
          "some error occured during fetching the payment for this order",
        error,
      });
    });
}

function updatePaymentStatus(request, response) {
  const paymentId = request.params._id;
  const { status } = request.body;
  const validStatuses = ["Pending", "Success", "Failed"];
  if (!validStatuses.includes(status)) {
    return response.status(400).send({
      success: false,
      message: "Invalid status. Must be 'Pending', 'Success', or 'Failed'.",
    });
  }
  Payments.findByIdAndUpdate(
    paymentId,
    { status },
    { new: true, runValidators: true }
  )
    .then((updatedPayment) => {
      if (!updatedPayment) {
        return response.status(404).send({
          success: false,
          message: "No payment found for this ID.",
        });
      }
      return response.status(200).send({
        success: true,
        message: `Payment status updated to '${status}' successfully.`,
        data: updatedPayment,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while updating payment status.",
        error,
      });
    });
}

function getAllPayments(request, response) {
  Payments.find()
    .populate("user order")
    .then((payments) => {
      if (!payments || payments.length === 0) {
        return response.status(200).json({
          success: true,
          da,
        });
      }
      return response.status(200).json({
        success: true,
        length: payments.length,
        message: "Payments fetched successfully for all users.",
        data: payments,
      });
    })
    .catch((error) => {
      return response.status(200).json({
        success: true,
        message: "Error in fetching Payments for all users.",
        error,
      });
    });
}

module.exports = {
  createNewPayment,
  verifyPayment,
  getUserPayments,
  getSpecificOrderPayment,
  updatePaymentStatus,
  getAllPayments,
};
