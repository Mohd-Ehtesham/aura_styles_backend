const Reviews = require("../models/reviewSchema");
const imagekit = require("../utils/imageKit");

function createNewReview(request, response) {
  const userId = request.user.id;
  const { product, reviewRating, comment } = request.body;
  const images = request.files || [];
  const uploadPromises = images.map((image) => {
    return imagekit.upload({
      file: image.buffer,
      fileName: image.originalname,
      folder: "review-images",
    });
  });
  Promise.all(uploadPromises)
    .then((uploadImages) => {
      const imageObjects = uploadImages.map((img) => ({
        url: img.url,
        fileId: img.fileId,
      }));
      const newReview = new Reviews({
        user: userId,
        product,
        reviewRating,
        comment,
        images: imageObjects,
      });
      const savedReview = newReview.save();
    })
    .then((savedReview) => {
      return response.status(201).send({
        success: true,
        message: "New Review created successfully",
        data: savedReview,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while creating the review",
        error,
      });
    });
}

function getAllReviews(request, response) {
  const limit = parseInt(request.query.limit) || 3;
  const skip = parseInt(request.query.skip) || 0;
  const productId = request.query.productId;
  const filter = productId ? { product: productId } : {};
  Reviews.countDocuments(filter)
    .then((totalReviews) => {
      return Reviews.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("user", "name")
        .populate("product", "name")
        .then((allReviews) => {
          if (!allReviews.length) {
            return response.status(200).send({
              success: true,
              data: [],
              total: 0,
              message: "There is no review to show",
            });
          }
          response.status(200).send({
            success: true,
            count: totalReviews,
            length: allReviews.length,
            message: "All reviews fetched successfully...",
            data: allReviews,
          });
        });
    })
    .catch((error) => {
      response.status(500).send({
        success: false,
        message: "Some error occured in fetching the reviews.",
        error,
      });
    });
}

function updateReview(request, response) {
  const reviewId = request.params.reviewId;
  const updatedReview = request.body;
  console.log("Incoming body:", request.body);

  Reviews.findByIdAndUpdate(reviewId, updatedReview, {
    new: true,
    runValidators: true,
  })
    .populate("user", "name")
    .then((upgradedReview) => {
      if (!upgradedReview) {
        response
          .status(400)
          .send({ success: false, message: "There is no review to update" });
      }
      return response.status(200).send({
        success: true,
        message: "The review is updated with the specific id...",
        data: upgradedReview,
      });
    })
    .catch((error) => {
      return response.status(200).send({
        success: false,
        message: "Some error occur in updating the review...",
        error,
      });
    });
}

function deleteReview(request, response) {
  const reviewId = request.params.reviewId;
  Reviews.findByIdAndDelete(reviewId)
    .then((deletedReview) => {
      if (!deletedReview) {
        response
          .status(400)
          .send({ success: false, message: "There is no review to delete" });
      }
      return response.status(200).send({
        success: true,
        message: "The review is deleted with the specific id...",
        data: deletedReview,
      });
    })
    .catch((error) => {
      return response.status(200).send({
        success: false,
        message: "Some error occur in deleting the review...",
        error,
      });
    });
}

module.exports = { createNewReview, getAllReviews, updateReview, deleteReview };
