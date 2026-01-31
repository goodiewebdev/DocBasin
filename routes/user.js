const express = require("express");
const router = express.Router();

const {
  signupUser,
  loginUser,
  getLoggedInUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
} = require("../controllers/user.js");
const auth = require("../middlewares/auth.js");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/sendotp", auth, sendVerifyOtp);
router.post("/verifyemail", auth, verifyEmail);
router.post("/sendresetotp", sendResetOtp);
router.post("/resetpassword", resetPassword);
router.get("/me", auth, getLoggedInUser);
router.get("/", auth, getAllUsers);
router.get("/:userId", auth, getUserById);
router.delete("/:userId", auth, deleteUser);
router.put("/:userId", auth, updateUser);

module.exports = router;
