const express = require("express");
const router = express.Router();
const {
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const admin = [isAuthenticatedUser, authorizeRoles("admin")];

router.get("/admin/categories", ...admin, getCategoriesAdmin);
router.post("/admin/category", ...admin, createCategory);
router.put("/admin/category/:id", ...admin, updateCategory);
router.delete("/admin/category/:id", ...admin, deleteCategory);

module.exports = router;
