const mongoose = require("mongoose");

const classLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Duplicate class nahi honi chahiye
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassLevel", classLevelSchema);
