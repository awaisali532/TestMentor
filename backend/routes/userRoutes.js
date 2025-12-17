const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary"); // ✅ Import Cloudinary Storage
const upload = multer({ storage }); // ✅ Configure Upload Middleware

// Import Controller Functions
const {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateProfile,
  updateProfileImage, // ✅ New Dedicated Route
  deleteProfileImage, // ✅ New Dedicated Route
  changePassword,
  uploadResume,
  deleteResume,
  getAdminProfile,
  updateBusinessInfo,
} = require("../controllers/userController");

// Import Auth Middleware
const { protect, hasPermission } = require("../middleware/authMiddleware");

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get("/admin-profile", getAdminProfile);

// ==========================================
// PROTECTED USER ROUTES (Profile & Settings)
// ==========================================

// 1. General Profile Update (Name + Optional Image)
router.put("/profile", protect, upload.single("image"), updateProfile);

// 2. Dedicated Profile Image Handling (Better for UI)
router.put(
  "/profile/image",
  protect,
  upload.single("image"),
  updateProfileImage
);
router.delete("/profile/image", protect, deleteProfileImage);

// 3. Security & Settings
router.put("/change-password", protect, changePassword);
router.put("/business-info", protect, updateBusinessInfo);

// 4. Resume Management (PDF)
router.put("/profile/resume", protect, upload.single("resume"), uploadResume);
router.put("/profile/resume/remove", protect, deleteResume);

// ==========================================
// ADMIN MANAGEMENT ROUTES (Requires Permission)
// ==========================================
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
