const express = require("express");
const router = express.Router();
const {
  createPattern,
  getAllPatterns,
  getPatternById,
  deletePattern,
  updatePattern,
} = require("../controllers/paperPatternController");

// Middleware
const { protect } = require("../middleware/authMiddleware");

// --- ROUTES ---

// 1. Get All & Create
// ✅ Removed 'hasPermission' from POST. Now any logged-in user can create.
router.route("/").get(protect, getAllPatterns).post(protect, createPattern);

// 2. Get Single, Delete, Update
// ✅ Logic inside controller handles permission (Owner vs Admin)
router
  .route("/:id")
  .get(protect, getPatternById)
  .delete(protect, deletePattern)
  .put(protect, updatePattern);

module.exports = router;
