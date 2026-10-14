const express = require("express");
const router = express.Router();
const {
  createOrder,
  myOrders,
  getOrder,
  getAdminOrders,
  updateOrderStatus,
  requestReturn,
} = require("../controllers/order");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post("/order", isAuthenticatedUser, createOrder);
router.get("/orders/me", isAuthenticatedUser, myOrders);
router.get("/order/:id", isAuthenticatedUser, getOrder);
router.put("/order/:id/return", isAuthenticatedUser, requestReturn);

router.get(
  "/admin/orders",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAdminOrders,
);
router.put(
  "/admin/order/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateOrderStatus,
);

module.exports = router;
