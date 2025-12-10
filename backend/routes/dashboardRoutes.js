const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, admin } = require("../middleware/authMiddleware");

// Protected Admin Route
router.get("/stats", protect, admin, getDashboardStats);

module.exports = router;
