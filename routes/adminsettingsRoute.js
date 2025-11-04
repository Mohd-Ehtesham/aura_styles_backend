const express = require("express");
const router = express.Router();

const {
  createAdminSetting,
  getAdminSettingById,
  updateAdminSettingById,
  deleteAdminSettingById,
  getAllAdminSettings,
  addBannerImage,
  removeBannerImage,
} = require("../controllers/adminsettingsController");

// middleware for uploading the banner images
const bannerImagesUploadingMiddleware = require("../middlewares/bannerImagesUploadMiddleware");

// route for creating the new admin setting
router.post(
  "/registerNewAdminSetting",
  bannerImagesUploadingMiddleware.array("bannerImages", 5),
  createAdminSetting
);

// route for getting the specific admin by id
router.get("/getAdminSettingById/:_id", getAdminSettingById);

// route for updating the specific admin by id
router.put(
  "/updateAdminSettingById/:_id",
  bannerImagesUploadingMiddleware.array("bannerImages", 5),
  updateAdminSettingById
);

// route for deleting the specific admin by id
router.delete("/deleteAdminSettingById/:_id", deleteAdminSettingById);

// route for getting all the admin settings
router.get("/allAdminSettings", getAllAdminSettings);

// route for only adding the banner images
router.post(
  "/addBannerImage/:_id",
  bannerImagesUploadingMiddleware.array("bannerImages", 5),
  addBannerImage
);

// route for only removing the banner images
router.delete(
  "/removeBannerImage/:_id",
  bannerImagesUploadingMiddleware.array("bannerImages", 5),
  removeBannerImage
);

module.exports = router;
