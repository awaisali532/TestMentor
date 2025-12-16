const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "urgent", "success"],
      default: "info",
    },
    // Optional: Agar notification sirf Paid users ke liye ho
    targetAudience: {
      type: String,
      enum: ["all", "free", "paid"],
      default: "all",
    },
    // Auto-delete ke liye (Optional)
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
