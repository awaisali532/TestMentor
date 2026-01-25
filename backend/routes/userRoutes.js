const express = require("express");
const router = express.Router();
const multer = require("multer");

// ✅ Multer Config for Memory Storage
// (Tumhare controller mein req.file.buffer use ho raha hai, is liye memoryStorage zaroori hai)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Import Controller Functions
const {
  // Admin Management
  getAllUsers,
  adminCreateUser, // Replaces old addUser
  updateUser, // Edit basic details
  deleteUser,
  toggleUserStatus, // Block/Unblock
  toggleVerification, // ✅ Manual Verify
  updateUserPlan, // ✅ Free/Paid
  resetUserLimits, // ✅ Reset Papers Count

  // User Profile & Settings
  updateProfile,
  updateProfileImage,
  deleteProfileImage,
  changePassword,

  // Resume & Business
  uploadResume,
  deleteResume,
  getAdminProfile,
  updateBusinessInfo,

  // Institute Settings
  updateInstituteInfo,
  updateInstituteLogo,
  deleteInstituteLogo,
} = require("../controllers/userController");

// Import Auth Middleware
const { protect, hasPermission } = require("../middleware/authMiddleware");

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
router.get("/admin-profile", getAdminProfile);

// ==========================================
// 2. USER SELF-MANAGEMENT (Protected)
// ==========================================

// --- Profile & Image ---
router.put("/profile", protect, upload.single("image"), updateProfile);
router.put(
  "/profile/image",
  protect,
  upload.single("image"),
  updateProfileImage,
);
router.delete("/profile/image", protect, deleteProfileImage);

// --- Security & Business ---
router.put("/change-password", protect, changePassword);
router.put("/business-info", protect, updateBusinessInfo);

// --- Resume Handling ---
router.put("/profile/resume", protect, upload.single("resume"), uploadResume);
router.put("/profile/resume/remove", protect, deleteResume);

// --- Institute Settings ---
router.put("/institute/info", protect, updateInstituteInfo);
router.put(
  "/institute/logo",
  protect,
  upload.single("logo"),
  updateInstituteLogo,
);
router.delete("/institute/logo", protect, deleteInstituteLogo);

// ==========================================
// 3. ADMIN USER MANAGEMENT (Full Access)
// ==========================================
// Note: 'manage_users' permission check is applied

// --- Create & Read ---
router.get("/all", protect, hasPermission("manage_users"), getAllUsers);
router.post("/add", protect, hasPermission("manage_users"), adminCreateUser); // ✅ New Direct Create

// --- Updates (Specific Features) ---
router.put(
  "/:id/verify",
  protect,
  hasPermission("manage_users"),
  toggleVerification,
); // ✅ Verify Manually
router.put("/:id/plan", protect, hasPermission("manage_users"), updateUserPlan); // ✅ Change Plan
router.put(
  "/:id/limits",
  protect,
  hasPermission("manage_users"),
  resetUserLimits,
); // ✅ Reset Limits
router.put(
  "/:id/status",
  protect,
  hasPermission("manage_users"),
  toggleUserStatus,
); // ✅ Block/Unblock

// --- General Update & Delete ---
router.put("/:id", protect, hasPermission("manage_users"), updateUser); // Edit Name/Role/Email
router.delete("/:id", protect, hasPermission("manage_users"), deleteUser);

module.exports = router;
