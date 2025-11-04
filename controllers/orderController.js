const Orders = require("../models/orderSchema");
const Products = require("../models/productSchema");

function createNewOrder(request, response) {
  const userId = request.user?.id;
  const data = request.body;
  if (!userId) {
    return response.status(400).send({
      success: false,
      message: "User is required for making an order...",
    });
  }
  if (!data.orderItems || data.orderItems.length === 0) {
    return response.status(400).send({
      success: false,
      message: "Order items are required.",
    });
  }
  const totalAmount = data.orderItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  Orders.create({ ...data, user: userId, totalAmount })
    .then((createdOrder) => {
      const stockUpdatePromises = data.orderItems.map((item) => {
        return Products.findById(item.product)
          .then((product) => {
            if (!product) return null;
            if (product.stock < item.quantity) {
              return Promise.reject({
                message: `Not enough stock for ${product.name}`,
              });
            }
            product.stock = product.stock - item.quantity;
            if (product.stock < 0) product.stock = 0;
            return product.save();
          })
          .catch((err) => {
            console.log("Stock update error:", err);
          });
      });
      return Promise.all(stockUpdatePromises).then(() => createdOrder);
    })
    .then((createdOrder) => {
      return Orders.findById(createdOrder._id).populate("user", "name");
    })
    .then((populatedOrder) => {
      return response.status(201).send({
        success: true,
        message: "New order is created successfully, stock updated.",
        data: populatedOrder,
      });
    })
    .catch((error) => {
      console.log("Order creation error:", error);
      return response.status(500).send({
        success: false,
        message: "Error while creating the order.",
        error,
      });
    });
}

function getUserOrders(request, response) {
  const userId = request.user.id;
  Orders.find({ user: userId })
    .then((allUserOrders) => {
      if (!allUserOrders || allUserOrders.length === 0) {
        return response.status(400).send({
          success: false,
          message: "There is no orders for user",
        });
      }
      return response.status(200).send({
        success: true,
        length: allUserOrders.length,
        message: "All orders of user fetched successfully",
        data: allUserOrders,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occuring in fetching the all orders of user",
        error,
      });
    });
}

function getOrderById(request, response) {
  const orderId = request.params.orderId;
  Orders.findOne({ order: orderId })
    .then((order) => {
      if (!order) {
        return response
          .status(400)
          .send({ success: false, message: "no order found..." });
      }
      return response.status(200).send({
        success: true,
        message: "order fetched successfully",
        data: order,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occuring in fetching the order this id",
        error,
      });
    });
}

function updateOrderPaymentToPaid(request, response) {
  const orderId = request.params._id;
  Orders.findById(orderId)
    .then((order) => {
      if (!order) {
        return response
          .status(400)
          .send({ success: false, message: "no order found..." });
      }
      order.paymentStatus = "Paid";
      order.isDelivered = false;
      order.deliveredAt = null;
      return order.save();
    })
    .then((updatedOrder) => {
      return response.status(200).send({
        success: true,
        message: "Order markes as paid",
        data: updatedOrder,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occuring in fetching the order of this id",
        error,
      });
    });
}

function updateOrderToDelivered(request, response) {
  const orderId = request.params._id;
  Orders.findById(orderId)
    .then((order) => {
      if (!order) {
        return response
          .status(400)
          .send({ success: false, message: "no order found..." });
      }
      order.isDelivered = true;
      order.deliveredAt = null;
      return order.save();
    })
    .then((updatedOrder) => {
      return response.status(200).send({
        success: true,
        message: "Order markes as delivered",
        data: updatedOrder,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occuring in fetching the order of this id",
        error,
      });
    });
}

function getAllOrders(request, response) {
  Orders.find({})
    .then((allOrders) => {
      if (!allOrders || allOrders.length === 0) {
        return response
          .status(400)
          .send({ success: false, message: "No orders found." });
      }
      return response.status(200).send({
        success: true,
        length: allOrders.length,
        message: "All orders fetched successfully",
        data: allOrders,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occuring in fetching all the orders",
        error,
      });
    });
}

function deleteOrder(request, response) {
  const userId = request.user.id;
  const orderId = request.params._id;
  Orders.findOneAndDelete({ user: userId, _id: orderId })
    .then((deletedOrder) => {
      if (!deletedOrder) {
        return response
          .status(404)
          .send({ success: false, message: "Error in deleting the order" });
      }
      return response.status(200).send({
        success: true,
        message: "Successfully deleted the order",
        data: deletedOrder,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occuring in deleting the order",
        error,
      });
    });
}

function getOrderSummaryStats(request, response) {
  Orders.aggregate([
    {
      $facet: {
        totalOrders: [{ $count: "count" }],
        totalRevenue: [
          { $match: { paymentStatus: "Paid" } },
          { $unwind: "$orderItems" },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$orderItems.price", "$orderItems.quantity"],
                },
              },
            },
          },
        ],
        statusCount: [
          {
            $group: {
              _id: "$paymentStatus",
              count: { $sum: 1 },
            },
          },
        ],
        deliveredCount: [
          {
            $group: {
              _id: "$isDelivered",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ])
    .then((result) => {
      const data = result[0];
      const totalOrders = data.totalOrders[0]?.count || 0;
      const totalRevenue = data.totalRevenue[0]?.total || 0;
      const statusCount = {};
      data.statusCount.forEach((entry) => {
        statusCount[entry._id] = entry.count;
      });
      const deliveredCount = {
        Delivered: 0,
        NotDelivered: 0,
      };
      data.deliveredCount.forEach((entry) => {
        if (entry._id === true) deliveredCount.Delivered = entry.count;
        else deliveredCount.NotDelivered = entry.count;
      });
      return response.status(200).send({
        success: true,
        data: {
          totalOrders,
          totalRevenue,
          statusCount,
          deliveredCount,
        },
      });
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: "Failed to get order summary stats",
        error,
      });
    });
}

module.exports = {
  createNewOrder,
  getUserOrders,
  getOrderById,
  updateOrderPaymentToPaid,
  updateOrderToDelivered,
  getAllOrders,
  deleteOrder,
  getOrderSummaryStats,
};
