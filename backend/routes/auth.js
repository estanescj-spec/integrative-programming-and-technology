const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
  logout,
  getProfile,
} = require("../controllers/auth");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/me", isAuthenticatedUser, getProfile);

module.exports = router;