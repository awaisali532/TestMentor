// models/Subject.js
const mongoose = require("mongoose");
const subjectSchema = new mongoose.Schema(
  {
    className: { type: String, required: true },
    subjectName: { type: String, required: true },
    year: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
