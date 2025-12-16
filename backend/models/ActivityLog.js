const mongoose = require("mongoose");

const activityLogSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String }, // Storing name for easier display
    action: {
      type: String,
      required: true,
      // Examples: "LOGGED_IN", "GENERATED_PAPER", "DELETED_PAPER", "UPDATED_PROFILE"
    },
    details: {
      type: String, // e.g., "Generated Physics 9th Class Paper"
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true, // Automaticaly adds createdAt (Time)
  }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
