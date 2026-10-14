const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/admin");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.get(
  "/admin/dashboard",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getDashboard,
);
router.get("/admin/users", isAuthenticatedUser, authorizeRoles("admin"), getUsers);
router.put(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateUser,
);
router.delete(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteUser,
);

module.exports = router;
