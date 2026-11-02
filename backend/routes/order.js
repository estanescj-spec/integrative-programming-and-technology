const express = require("express");
const router = express.Router();
const { createOrder, myOrders, getOrder, requestReturn, cancelOrder, updateShipping, getAdminOrders, updateOrderStatus, decideReturn, } = require("../controllers/order");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post("/order", isAuthenticatedUser, createOrder);
router.get("/orders/me", isAuthenticatedUser, myOrders);
router.get("/order/:id", isAuthenticatedUser, getOrder);
router.put("/order/:id/return", isAuthenticatedUser, requestReturn);
router.put("/order/:id/cancel", isAuthenticatedUser, cancelOrder);
router.put("/order/:id/shipping", isAuthenticatedUser, updateShipping);

router.get("/admin/orders", isAuthenticatedUser, authorizeRoles("admin"), getAdminOrders,);
router.put("/admin/order/:id", isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus,);
router.put("/admin/order/:id/return", isAuthenticatedUser, authorizeRoles("admin"), decideReturn,);

module.exports = router;