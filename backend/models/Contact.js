const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
    },
    subject: {
      type: String,
      required: [true, "Please add a subject"],
    },
    message: {
      type: String,
      required: [true, "Please add a message"],
    },
    status: {
      type: String,
      enum: ["New", "Read"],
      default: "New",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Contact", contactSchema);
