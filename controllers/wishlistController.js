const Wishlists = require("../models/wishlistSchema");

function toggleWishlistProduct(req, res) {
  const userId = req.user.id;
  const productId = req.params.productId;
  Wishlists.findOne({ user: userId })
    .then((wishlist) => {
      if (!wishlist) {
        const newWishlist = new Wishlists({
          user: userId,
          products: [productId],
        });
        return newWishlist.save();
      }
      const productIndex = wishlist.products.findIndex(
        (p) => p.toString() === productId.toString()
      );
      if (productIndex > -1) {
        wishlist.products.splice(productIndex, 1);
      } else {
        wishlist.products.push(productId);
      }
      return wishlist.save();
    })
    .then((updatedWishlist) => {
      res.status(200).send({
        success: true,
        message: "Wishlist updated successfully",
        data: updatedWishlist,
      });
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: "Something went wrong while updating wishlist",
        error,
      });
    });
}

function getUserSpecificWishlist(req, res) {
  const userId = req.user.id;
  Wishlists.findOne({ user: userId })
    .populate("products", "name brand price discountPrice sizes stock images")
    .then((wishlist) => {
      if (!wishlist) {
        return res.status(404).send({
          success: false,
          message: "No wishlist found for this user",
        });
      }
      res.status(200).send({
        success: true,
        message: "Wishlist fetched successfully",
        data: wishlist,
      });
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: "Error while fetching wishlist",
        error,
      });
    });
}

function removeProductFromWishlist(req, res) {
  const userId = req.user.id;
  const productId = req.params.productId;
  if (!userId) {
    return res.status(400).send({
      success: false,
      message: "User ID is required",
    });
  }
  if (!productId) {
    return res.status(400).send({
      success: false,
      message: "Product ID is required",
    });
  }
  Wishlists.findOne({ user: userId })
    .then((wishlist) => {
      if (!wishlist) {
        return res.status(404).send({
          success: false,
          message: "Wishlist not found for this user",
        });
      }
      wishlist.products = wishlist.products.filter(
        (product) => product.toString() !== productId.toString()
      );
      return wishlist.save();
    })
    .then((updatedWishlist) => {
      if (updatedWishlist) {
        return res.status(200).send({
          success: true,
          message: "Product removed from wishlist successfully",
          data: updatedWishlist,
        });
      }
      return null;
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: "Error while removing product from wishlist",
        error,
      });
    });
}

module.exports = {
  toggleWishlistProduct,
  getUserSpecificWishlist,
  removeProductFromWishlist,
};
