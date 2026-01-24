const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["info", "warning", "urgent", "success"],
      default: "info",
    },
    messageEn: {
      type: String,
      required: true,
    },
    messageUr: {
      type: String, // Urdu text
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["all", "free", "paid"],
      default: "all",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
