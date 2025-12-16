const Notification = require("../models/Notification");

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Public/User
exports.getNotifications = async (req, res) => {
  try {
    // Newest notifications first
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private (Admin Only)
exports.createNotification = async (req, res) => {
  const { title, message, type, targetAudience } = req.body;

  try {
    const notification = await Notification.create({
      title,
      message,
      type: type || "info",
      targetAudience: targetAudience || "all",
    });

    res.status(201).json(notification);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create notification", error: err.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin Only)
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      await notification.deleteOne();
      res.json({ message: "Notification removed" });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
