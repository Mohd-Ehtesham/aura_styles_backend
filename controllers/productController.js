const imagekit = require("../utils/imageKit");

const Products = require("../models/productSchema");

function createNewProduct(request, response) {
  const {
    name,
    brand,
    description,
    category,
    price,
    discountPrice,
    sizes,
    stock,
    isFeatured,
    rating,
    numReviews,
  } = request.body;
  if (!name) {
    return response.status(400).json({
      success: false,
      message: "Product name is required.",
    });
  }
  Products.findOne({ name })
    .then((existingProduct) => {
      if (existingProduct) {
        return Promise.reject({
          status: 400,
          message: "Product with the same name already exists.",
        });
      }
      const images = request.files;
      if (!images || images.length === 0) {
        return Promise.reject({
          status: 400,
          message: "No product images provided.",
        });
      }
      const uploadPromises = images.map((image) => {
        if (!image.buffer || !image.originalname) {
          return Promise.reject(new Error("Invalid image file"));
        }
        return imagekit.upload({
          file: image.buffer,
          fileName: image.originalname,
          folder: "product-images",
        });
      });
      return Promise.all(uploadPromises);
    })
    .then((uploadResults) => {
      const productImages = uploadResults.map((result) => ({
        url: result.url,
        fileId: result.fileId,
      }));
      const newProduct = new Products({
        name,
        brand,
        description,
        category,
        price,
        discountPrice,
        sizes,
        stock,
        images: productImages,
        isFeatured,
        rating,
        numReviews,
      });
      return newProduct.save();
    })
    .then((savedProduct) => {
      return response.status(201).json({
        success: true,
        message: "New product created successfully.",
        data: savedProduct,
      });
    })
    .catch((error) => {
      if (error.status) {
        return response.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      return response.status(500).json({
        success: false,
        message: "An error occurred while creating the product.",
        error: error.message || error,
      });
    });
}

function getAllProducts(request, response) {
  const limit = parseInt(request.query.limit) || 3;
  const skip = parseInt(request.query.skip) || 0;
  Products.find({})
    .skip(skip)
    .limit(limit)
    .then((allProducts) => {
      Products.countDocuments()
        .then((totalCount) => {
          response.status(200).send({
            success: true,
            length: allProducts.length,
            total: totalCount,
            message: "Products fetched successfully",
            data: allProducts,
          });
        })
        .catch((countError) => {
          response.status(500).send({
            success: false,
            message: "Failed to fetch product count.",
            error: countError.message || countError,
          });
        });
    })
    .catch((error) => {
      response.status(500).send({
        success: false,
        message: "Some error occurred while fetching the products.",
        error: error.message || error,
      });
    });
}

function getProduct(request, response) {
  const { _id } = request.params;
  Products.findById(_id)
    .then((fetchProduct) => {
      if (!fetchProduct) {
        return response.status(400).send({
          success: false,
          message: "Product not exist",
        });
      }
      return response.status(200).send({
        success: true,
        message: "The product with given id is fetched",
        data: fetchProduct,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error while fetching Product",
        error,
      });
    });
}

function updateProduct(request, response) {
  const { _id } = request.params;
  const updatedProduct = request.body;
  Products.findByIdAndUpdate(_id, updatedProduct, {
    new: true,
    runValidators: true,
  })
    .then((updatedProduct) => {
      if (!updatedProduct) {
        return response.status(400).send({
          success: false,
          message: "The product you want to update does not exist...",
        });
      }
      return response.status(200).send({
        success: true,
        message: "The product with given id is updated",
        data: updatedProduct,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error while updating Product",
        error,
      });
    });
}

function deleteProduct(request, response) {
  const { _id } = request.params;
  Products.findById(_id)
    .then((product) => {
      if (!product) {
        return Promise.reject({
          status: 400,
          message: "There is no product to delete",
        });
      }
      const deleteImagePromises = [];
      if (Array.isArray(product.images)) {
        product.images.forEach((image) => {
          if (image.fileId) {
            deleteImagePromises.push(imagekit.deleteFile(image.fileId));
          }
        });
      } else if (typeof product.images === "object" && product.images?.fileId) {
        deleteImagePromises.push(imagekit.deleteFile(product.images.fileId));
      }
      return Promise.all(deleteImagePromises).then(() =>
        Products.findByIdAndDelete(_id)
      );
    })
    .then((deletedProduct) => {
      if (!deletedProduct) {
        return response.status(400).json({
          success: false,
          message: "Product already deleted or not found",
        });
      }
      return response.status(200).json({
        success: true,
        message: "The product has been deleted successfully",
        data: deletedProduct,
      });
    })
    .catch((error) => {
      const status = error?.status || 500;
      const message =
        error?.message || "An error occurred while deleting the product";
      return response.status(status).json({
        success: false,
        message,
        error,
      });
    });
}

function addProductImage(request, response) {
  const productId = request.params._id;
  const files = request.files || [];
  const addedProductImages = [];
  const uploadPromises = files.map((file) => {
    return imagekit
      .upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: "product-images",
      })
      .then((uploadResponse) => {
        addedProductImages.push({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
        });
      });
  });
  Promise.all(uploadPromises)
    .then(() => {
      if (addedProductImages.length === 0) {
        return response.status(400).send({
          success: false,
          message: "No product images were uploaded",
        });
      }
      return Products.findByIdAndUpdate(
        productId,
        {
          $push: { images: { $each: addedProductImages } },
        },
        { new: true }
      );
    })
    .then((updatedProduct) => {
      if (!updatedProduct) {
        return response
          .status(404)
          .send({ success: false, message: "Product images were not found" });
      }
      return response.status(201).send({
        success: true,
        message: "Product image(s) added successfully",
        data: updatedProduct,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while adding the product image",
        error: error.message || error,
      });
    });
}

function removeProductImage(request, response) {
  const productId = request.params._id;
  const { fileIds } = request.body;
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return response.status(400).json({
      success: false,
      message: "No fileIds provided for deletion",
    });
  }
  const removedPromises = fileIds.map((fileId) => {
    return imagekit.deleteFile(fileId);
  });
  Promise.all(removedPromises)
    .then(() => {
      return Products.findByIdAndUpdate(
        productId,
        { $pull: { images: { fileId: { $in: fileIds } } } },
        { new: true }
      );
    })
    .then((updatedProductImages) => {
      if (!updatedProductImages) {
        return response
          .status(404)
          .send({ success: false, message: "Product not found" });
      }
      return response.status(200).send({
        success: true,
        message: "Product image(s) removed successfully",
        data: updatedProductImages,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while removing the product image",
        error: error.message || error,
      });
    });
}

function searchProduct(request, response) {
  const limit = parseInt(request.query.limit) || 3;
  const skip = parseInt(request.query.skip) || 0;
  const query = request.query.query;
  if (!query) {
    return response.status(400).send({
      success: false,
      message: "Search query is required",
    });
  }
  Products.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { brand: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
    ],
  })
    .skip(skip)
    .limit(limit)
    .then((searchedResults) => {
      if (!searchedResults || searchedResults.length === 0) {
        return response.status(404).send({
          success: false,
          message: "No products found matching the search query",
        });
      }
      return response.status(200).send({
        success: true,
        message: "Products fetched successfully",
        data: searchedResults,
        length: searchedResults.length,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while searching for products",
        error: error.message || error,
      });
    });
}

module.exports = {
  createNewProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  removeProductImage,
  searchProduct,
};
