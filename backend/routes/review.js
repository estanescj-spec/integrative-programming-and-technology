const express = require("express");
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
} = require("../controllers/review");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.get("/reviews/:productId", getProductReviews);
router.post("/review", isAuthenticatedUser, createReview);
router.put("/review/:id", isAuthenticatedUser, updateReview);
router.delete(
  "/admin/review/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteReview,
);
router.get(
  "/admin/reviews",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllReviews,
);

module.exports = router;
