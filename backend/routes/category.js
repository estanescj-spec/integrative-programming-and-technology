const express = require("express");
const router = express.Router();
const { getCategoriesAdmin, upsertCategory } = require("../controllers/category");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.get(
  "/admin/categories",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getCategoriesAdmin,
);
router.put(
  "/admin/category",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  upsertCategory,
);

module.exports = router;
