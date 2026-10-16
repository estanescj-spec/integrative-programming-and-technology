const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  getCategories,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} = require("../controllers/product");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { productRules } = require("../middlewares/validate");

router.get("/products", getProducts);
router.get("/products/categories", getCategories);
router.get("/product/:id", getProduct);

router.get(
  "/admin/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAdminProducts,
);
router.post(
  "/admin/product",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  productRules,
  createProduct,
);
router.put(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProduct,
);
router.delete(
  "/admin/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct,
);
router.post(
  "/admin/products/bulk-delete",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  bulkDeleteProducts,
);

module.exports = router;
