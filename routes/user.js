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
} = require("../controllers/user.js");
const auth = require("../middlewares/auth.js");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/me", auth, getLoggedInUser);
router.get("/getallusers", auth, getAllUsers);
router.get("/:id", auth, getUserById);
router.delete("/delete/:userId", auth, deleteUser);
router.put("/update/:userId", auth, updateUser);

module.exports = router;
