const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  deleteNotification,
} = require("../controllers/notificationController");

// Import Middleware (Adjust path based on your folder structure)
const { protect, admin } = require("../middleware/authMiddleware");

// Route for fetching notifications (Open for verified users)
// Agar aap chahte hain bina login ke bhi dikhe, to 'protect' hata dein.
router.get("/", protect, getNotifications);

// Route for creating notifications (Only Admin)
router.post("/", protect, admin, createNotification);

// Route for deleting (Only Admin)
router.delete("/:id", protect, admin, deleteNotification);

module.exports = router;
