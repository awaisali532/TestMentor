const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateProfile,
  removeProfileImage,
  changePassword,
  uploadResume, //
  deleteResume,
  getAdminProfile,
  updateBusinessInfo,
} = require("../controllers/userController");

const {
  protect,
  admin,
  hasPermission,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// --- ROUTES ---
router.get("/admin-profile", getAdminProfile);

// 1. Profile Routes
router.put("/profile", protect, upload.single("image"), updateProfile);
router.put("/profile/remove-image", protect, removeProfileImage);
router.put("/change-password", protect, changePassword);
router.put("/business-info", protect, updateBusinessInfo);
// ✅ NEW: Resume Upload Route (Only Super Admin should use this logically)
// We use upload.single("resume") to expect a file field named 'resume'
router.put("/profile/resume", protect, upload.single("resume"), uploadResume);
router.put("/profile/resume/remove", protect, deleteResume); // 🗑️ Delete Route
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
