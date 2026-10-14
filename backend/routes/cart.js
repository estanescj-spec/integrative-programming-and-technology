const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cart");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.get("/cart", isAuthenticatedUser, getCart);
router.post("/cart", isAuthenticatedUser, addToCart);
router.put("/cart", isAuthenticatedUser, updateCartItem);
router.delete("/cart", isAuthenticatedUser, removeCartItem);

module.exports = router;
