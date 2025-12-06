const express = require("express");
const router = express.Router();
const {
  addChapter,
  getChaptersBySubject,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapterController");

// Existing Routes...
router.post("/add", addChapter);
router.get("/subject/:subjectId", getChaptersBySubject);

// ✅ NEW ROUTE FOR UPDATE
router.put("/:id", updateChapter);
router.delete("/:id", deleteChapter);
module.exports = router;
