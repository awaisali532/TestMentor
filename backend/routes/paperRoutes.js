const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Auth middleware path confirm kar lein

const {
  savePaper,
  getMyPapers,
  getPaperById,
  updatePaper, // ✅ Ab ye Controller se mil jayega
  deletePaper,
  clearAdminTestPapers,
} = require("../controllers/paperController");

// Create New
router.post("/save", protect, savePaper);

// Clear Admin Test Papers
router.delete("/clear-test-papers", protect, clearAdminTestPapers);

// ✅ Update Existing
router.put("/:id", protect, updatePaper);

// Get Lists
router.get("/my-papers", protect, getMyPapers);
router.get("/:id", protect, getPaperById);
router.delete("/:id", protect, deletePaper);
module.exports = router;
