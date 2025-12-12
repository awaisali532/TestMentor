const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateProfile,
  removeProfileImage, // ✅ Import this
  changePassword,
} = require("../controllers/userController");

const {
  protect,
  admin,
  hasPermission,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// --- ROUTES ---

// 1. Profile Routes
router.put("/profile", protect, upload.single("image"), updateProfile);
router.put("/profile/remove-image", protect, removeProfileImage); // ✅ New Route
router.put("/change-password", protect, changePassword);

// 2. Admin Management Routes
router.get("/all", protect, hasPermission("manage_users"), getAllUsers);
router.post("/add", protect, hasPermission("manage_users"), addUser);
router.put("/:id", protect, hasPermission("manage_users"), updateUser);
router.delete("/:id", protect, hasPermission("manage_users"), deleteUser);
router.patch(
  "/status/:id",
  protect,
  hasPermission("manage_users"),
  toggleUserStatus
);

module.exports = router;
