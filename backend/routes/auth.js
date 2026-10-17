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
  resendVerification,
} = require("../controllers/auth");
const { isAuthenticatedUser } = require("../middlewares/auth");
const { registerRules, profileRules } = require("../middlewares/validate");

router.post("/register", registerRules, registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/me", isAuthenticatedUser, getProfile);
router.put("/me", isAuthenticatedUser, profileRules, updateProfile);
router.post("/google-login", googleLogin);
router.post("/resend-verification", resendVerification);

module.exports = router;
