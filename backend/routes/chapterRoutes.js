// backend/routes/chapterRoutes.js
const express = require("express");
const router = express.Router();
const {
  addChapter,
  getChaptersBySubject,
} = require("../controllers/chapterController");

router.post("/add", addChapter);
router.get("/:subjectId", getChaptersBySubject); // Subject ID doge, Chapters milenge

module.exports = router;
