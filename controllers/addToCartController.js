const AddToCarts = require("../models/addToCartSchema");

function addProductToCart(request, response) {
  const userId = request.user.id;
  const productId = request.params.productId;
  const { size, quantity } = request.body;
  AddToCarts.findOne({ user: userId })
    .then((cart) => {
      if (!cart) {
        const newCart = new AddToCarts({
          user: userId,
          products: [{ product: productId, size, quantity }],
        });
        return newCart.save();
      }
      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId.toString() && p.size === size
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, size, quantity });
      }
      return cart.save();
    })
    .then((newCart) => {
      return response.status(200).send({
        success: true,
        message: "Product Added to cart successfully",
        data: newCart,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Product is not added to cart successfully",
        error,
      });
    });
}

function removeProductFromCart(request, response) {
  const userId = request.user.id;
  const productId = request.params.productId;
  AddToCarts.findOneAndUpdate(
    { user: userId },
    { $pull: { products: { product: productId } } },
    { new: true }
  )
    .then(async (updatedCart) => {
      if (!updatedCart) {
        return response.status(404).send({
          success: false,
          message: "Cart not found for this user",
        });
      }
      if (updatedCart.products.length === 0) {
        await AddToCarts.findOneAndDelete({ user: userId });
        return response.status(200).send({
          success: true,
          message: "Product removed and empty cart deleted from DB",
        });
      }
      return response.status(200).send({
        success: true,
        message: "Product removed from cart",
        data: updatedCart,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error while removing product from cart",
        error,
      });
    });
}

function showAllCartProducts(request, response) {
  const userId = request.user.id;
  AddToCarts.findOne({ user: userId })
    .populate({
      path: "products.product",
      select: "name brand images rating category price discountPrice",
    })
    .then((userCart) => {
      if (!userCart) {
        return response
          .status(200)
          .send({ success: false, message: "Your Cart is Empty " });
      }
      return response.status(200).send({
        success: true,
        length: userCart.products.length,
        message: "All products of cart is fetched",
        data: [userCart],
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Some error occur in fetching cart products",
        error,
      });
    });
}

function updateCartQuantity(request, response) {
  const userId = request.user.id;
  const productId = request.params.productId;
  const { quantity } = request.body;
  if (!quantity || quantity < 1) {
    return response.status(400).send({
      success: false,
      message: "Quantity is required and should be at least 1",
    });
  }
  AddToCarts.findOne({ user: userId })
    .then((cart) => {
      if (!cart) {
        return response.status(404).send({
          success: false,
          message: "Cart not found for this user",
        });
      }
      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId.toString()
      );
      if (productIndex === -1) {
        return response.status(404).send({
          success: false,
          message: "Product not found in the cart",
        });
      }
      cart.products[productIndex].quantity = quantity;
      return cart.save();
    })
    .then((updatedCart) => {
      if (updatedCart) {
        return response.status(200).send({
          success: true,
          message: "Product quantity updated successfully",
          data: updatedCart,
        });
      }
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error updating product quantity in cart",
        error,
      });
    });
}

function clearCart(request, response) {
  const userId = request.user.id;
  AddToCarts.findOneAndDelete(
    { user: userId },
    { $set: { products: [] } },
    { new: true }
  )
    .then((cartProduct) => {
      if (!cartProduct) {
        return response.status(404).send({
          success: false,
          message: "Cart not found for this user",
        });
      }
      return response.status(200).send({
        success: true,
        message: "Cart cleared successfully",
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error updating product quantity in cart",
        error,
      });
    });
}

module.exports = {
  addProductToCart,
  removeProductFromCart,
  showAllCartProducts,
  updateCartQuantity,
  clearCart,
};
