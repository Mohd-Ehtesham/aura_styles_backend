const imagekit = require("../utils/imageKit");

const Adminsetting = require("../models/adminsettingsSchema");

function createAdminSetting(request, response) {
  const { offerText, contactEmail, contactPhone } = request.body;
  const images = request.files;
  if (!images || images.length === 0) {
    return response.status(400).json({
      success: false,
      message: "No banner images provided",
    });
  }
  const uploadPromises = images.map((image) => {
    if (!image.buffer || !image.originalname) {
      return Promise.reject(new Error("Invalid image file"));
    }
    return imagekit.upload({
      file: image.buffer,
      fileName: image.originalname,
      folder: "banner-images",
    });
  });
  Promise.all(uploadPromises)
    .then((uploadResults) => {
      const bannerImages = uploadResults.map((result) => ({
        url: result.url,
        fileId: result.fileId,
      }));
      const newAdminSetting = new Adminsetting({
        offerText,
        contactEmail,
        contactPhone,
        bannerImages,
      });
      return newAdminSetting.save();
    })
    .then((savedSetting) => {
      response.status(201).json({
        success: true,
        message: "Admin setting created successfully",
        data: savedSetting,
      });
    })
    .catch((error) => {
      let message = "Error creating admin setting";
      if (error.code === 11000 && error.keyPattern?.contactEmail) {
        message = "Email already exists";
      } else if (error.message === "Invalid image file") {
        message = "Invalid image file uploaded";
      }
      response.status(500).json({
        success: false,
        message,
        error: error.message || error,
      });
    });
}

function getAdminSettingById(request, response) {
  const adminSettingId = request.params._id;
  if (!adminSettingId) {
    return response.status(400).send({
      success: false,
      message: "Admin setting ID is required in the URL.",
    });
  }
  Adminsetting.findById(adminSettingId)
    .then((adminSetting) => {
      if (!adminSetting) {
        return response
          .status(404)
          .send({ success: false, message: "Admin setting not found" });
      }
      return response.status(200).send({
        success: true,
        message: "Admin setting fetched successfully",
        data: adminSetting,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while fetching admin setting.",
        error: error.message || error,
      });
    });
}

function updateAdminSettingById(request, response) {
  const adminSettingId = request.params._id;
  const { offerText, contactEmail, contactPhone } = request.body;
  const files = request.files || [];
  const bannerImages = [];
  const uploadPromise = files.map((file) => {
    return imagekit
      .upload({
        file: file.buffer,
        fileName: file.originalname,
      })
      .then((uploadResponse) => {
        bannerImages.push({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
          folder: "/Banner Images",
        });
      });
  });
  Promise.all(uploadPromise)
    .then(() => {
      const updatedFields = {
        ...(offerText && { offerText }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
      };
      if (bannerImages.length > 0) {
        return Adminsetting.findByIdAndUpdate(
          adminSettingId,
          {
            ...updatedFields,
            $push: { bannerImages: { $each: bannerImages } },
          },
          { new: true, runValidators: true }
        );
      } else {
        return Adminsetting.findByIdAndUpdate(adminSettingId, updatedFields, {
          new: true,
          runValidators: true,
        });
      }
    })
    .then((adminSetting) => {
      if (!adminSetting) {
        return response
          .status(404)
          .send({ success: false, message: "Admin setting not found" });
      }
      return response.status(200).send({
        success: true,
        message: "Admin setting updated successfully",
        data: adminSetting,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while updating the admin setting.",
        error: error.message || error,
      });
    });
}

function deleteAdminSettingById(request, response) {
  const adminSettingId = request.params._id;
  Adminsetting.findById(adminSettingId)
    .then((adminsetting) => {
      if (!adminsetting) {
        return response
          .status(404)
          .send({ success: false, message: "Admin setting not found" });
      }
      const deleteImagePromises = [];
      if (Array.isArray(adminsetting.bannerImages)) {
        adminsetting.bannerImages.forEach((imageObj) => {
          if (imageObj.fileId) {
            deleteImagePromises.push(imagekit.deleteFile(imageObj.fileId));
          }
        });
      }
      return Promise.all(deleteImagePromises).then(() =>
        Adminsetting.findByIdAndDelete(adminSettingId)
      );
    })
    .then((deletedAdminSetting) => {
      return response.status(200).send({
        success: true,
        message: "Admin setting deleted",
        data: deletedAdminSetting,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while deleting the admin setting.",
        error: error.message || error,
      });
    });
}

function getAllAdminSettings(request, response) {
  Adminsetting.find()
    .then((allAdminSetting) => {
      if (!allAdminSetting) {
        return response
          .status(404)
          .send({ success: false, message: "No admin setting are found" });
      }
      return response.status(200).send({
        success: true,
        length: allAdminSetting.length,
        message: "All admin data are fetched successfully",
        data: allAdminSetting,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while fetching all the admin setting.",
        error: error.message || error,
      });
    });
}

function addBannerImage(request, response) {
  const adminSettingId = request.params._id;
  const files = request.files || [];
  const addedBannerImages = [];
  const uploadPromises = files.map((file) => {
    return imagekit
      .upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: "banner-images",
      })
      .then((uploadResponse) => {
        addedBannerImages.push({
          url: uploadResponse.url,
          fileId: uploadResponse.fileId,
        });
      });
  });
  Promise.all(uploadPromises)
    .then(() => {
      if (addedBannerImages.length === 0) {
        return response.status(400).send({
          success: false,
          message: "No banner images were uploaded",
        });
      }
      return Adminsetting.findByIdAndUpdate(
        adminSettingId,
        {
          $push: { bannerImages: { $each: addedBannerImages } },
        },
        { new: true }
      );
    })
    .then((updatedSetting) => {
      if (!updatedSetting) {
        return response
          .status(404)
          .send({ success: false, message: "Admin setting not found" });
      }
      return response.status(201).send({
        success: true,
        message: "Banner image(s) added successfully",
        data: updatedSetting,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while adding the banner image",
        error: error.message || error,
      });
    });
}

function removeBannerImage(request, response) {
  const adminSettingId = request.params._id;
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
      return Adminsetting.findByIdAndUpdate(
        adminSettingId,
        { $pull: { bannerImages: { fileId: { $in: fileIds } } } },
        { new: true }
      );
    })
    .then((updatedSetting) => {
      if (!updatedSetting) {
        return response
          .status(404)
          .send({ success: false, message: "Admin setting not found" });
      }
      return response.status(200).send({
        success: true,
        message: "Banner image(s) removed successfully",
        data: updatedSetting,
      });
    })
    .catch((error) => {
      return response.status(500).send({
        success: false,
        message: "Error occurred while removing the banner image",
        error: error.message || error,
      });
    });
}

module.exports = {
  createAdminSetting,
  getAdminSettingById,
  updateAdminSettingById,
  deleteAdminSettingById,
  getAllAdminSettings,
  addBannerImage,
  removeBannerImage,
};
