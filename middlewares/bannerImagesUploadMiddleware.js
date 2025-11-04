const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = function (request, file, callback) {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Only images are allowed!"), false);
  }
};

const bannerImagesUpload = multer({ storage, fileFilter });

module.exports = bannerImagesUpload;
