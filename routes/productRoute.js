const express = require("express");
const router = express.Router();

const {
  createNewProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  removeProductImage,
  searchProduct,
} = require("../controllers/productController");

// middleware for uploading the product images
const productImagesUploadMiddleware = require("../middlewares/productImagesUploadMiddleware");

// route for creating new Product
router.post(
  "/registerProduct",
  productImagesUploadMiddleware.array("images", 7),
  createNewProduct
);

// route for getting all products
router.get("/allProducts", getAllProducts);

// route for getting product
router.get("/getProduct/:_id", getProduct);

// route for updating the product
router.put("/updateProduct/:_id", updateProduct);

// route for deleting the product
router.delete("/deleteProduct/:_id", deleteProduct);

// route for adding the product image
router.post(
  "/addingProductImage/:_id",
  productImagesUploadMiddleware.array("images", 7),
  addProductImage
);

// route for removing the product image
router.delete(
  "/removingProductImage/:_id",
  productImagesUploadMiddleware.array("images", 7),
  removeProductImage
);

// route for searching products by name or category
router.get("/searchProducts", searchProduct);
module.exports = router;
