const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
  logout,
  getProfile,
  googleLogin,
  updateProfile,
} = require("../controllers/auth");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.post("/register", registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/me", isAuthenticatedUser, getProfile);
router.put("/me", isAuthenticatedUser, updateProfile);
router.post("/google-login", googleLogin);

module.exports = router;
