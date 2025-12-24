const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Auth middleware path confirm kar lein

const {
  savePaper,
  getMyPapers,
  getPaperById,
  updatePaper, // ✅ Ab ye Controller se mil jayega
} = require("../controllers/paperController");

// Create New
router.post("/save", protect, savePaper);

// ✅ Update Existing
router.put("/:id", protect, updatePaper);

// Get Lists
router.get("/my-papers", protect, getMyPapers);
router.get("/:id", protect, getPaperById);

module.exports = router;
