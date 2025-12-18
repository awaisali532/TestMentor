const express = require("express");
const router = express.Router();
const {
  addChapter,
  getChaptersBySubject,
  updateChapter,
  deleteChapter,
  addBulkChapters,
  getChaptersByFilter,
} = require("../controllers/chapterController");
const { protect, hasPermission } = require("../middleware/authMiddleware");
// Existing Routes...
router.post("/add", addChapter);
router.get("/subject/:subjectId", getChaptersBySubject);
router.post("/add-bulk", addBulkChapters);
// ✅ NEW ROUTE FOR UPDATE
router.put("/:id", updateChapter);
router.delete("/:id", deleteChapter);
router.get("/filter", protect, getChaptersByFilter);
module.exports = router;
