const express = require("express");
const router = express.Router();

const {
  createNewUser,
  loginUser,
  protectedUser,
  getLoggedUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const avatarUpload = require("../middlewares/avatarUpload");
const authMiddleware = require("../middlewares/authMiddleware");

// rote for creating new user
router.post("/registerUser", avatarUpload.single("avatar"), createNewUser);

// route for login existed user
router.post("/loginUser", loginUser);

// route for protected user
router.get("/protectedUser", authMiddleware, protectedUser);

// route for getting logged in user
router.get("/getLoggedUser", authMiddleware, getLoggedUser);

// route for getting all user
router.get("/allUsers", getUsers);

// route for updating the user
router.put("/updateUser/:_id", authMiddleware, updateUser);

// route for deleting the user
router.delete("/deleteUser/:_id", deleteUser);

module.exports = router;
