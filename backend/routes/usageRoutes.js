const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const checkSubscription = require("../middleware/checkSubscription"); // 👈 Import New Middleware
const {
  trackPaperGeneration,
  getUsageStats,
} = require("../controllers/usageController");

// POST /api/usage/track-paper
router.post("/track-paper", protect, checkSubscription, trackPaperGeneration);
router.get("/stats", protect, checkSubscription, getUsageStats);
module.exports = router;
