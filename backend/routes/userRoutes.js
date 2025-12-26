const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage }); // Standard config (though controller uses memory buffer logic)

// Import Controller Functions
const {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateProfile,
  updateProfileImage,
  deleteProfileImage,
  changePassword,
  uploadResume,
  deleteResume,
  getAdminProfile,
  updateBusinessInfo,
  updateInstituteInfo, // ✅ New
  updateInstituteLogo, // ✅ New
  deleteInstituteLogo, // ✅ New
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

// 1. General Profile Update
router.put("/profile", protect, upload.single("image"), updateProfile);

// 2. Profile Image Handling
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

// 4. Resume Management
router.put("/profile/resume", protect, upload.single("resume"), uploadResume);
router.put("/profile/resume/remove", protect, deleteResume);

// 5. ✅ INSTITUTE SETTINGS (New)
router.put("/institute/info", protect, updateInstituteInfo); // Text Data
router.put(
  "/institute/logo",
  protect,
  upload.single("logo"),
  updateInstituteLogo
); // Logo Upload
router.delete("/institute/logo", protect, deleteInstituteLogo); // Logo Remove

// ==========================================
// ADMIN MANAGEMENT ROUTES
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
