const express = require("express");
const router = express.Router();
const {
  createPattern,
  getAllPatterns,
  getPatternById,
  updatePattern,
  deletePattern,
} = require("../controllers/paperPatternController");

// Middleware to check if user is logged in
const { protect } = require("../middleware/authMiddleware");

// Base Route: /api/patterns

// 1. Create & Get All
router
  .route("/")
  .post(protect, createPattern) // Create New
  .get(protect, getAllPatterns); // List All

// 2. Single Pattern Operations (Get, Update, Delete)
router
  .route("/:id")
  .get(protect, getPatternById) // Fetch details (with pairing info)
  .put(protect, updatePattern) // Edit
  .delete(protect, deletePattern); // Delete

module.exports = router;
