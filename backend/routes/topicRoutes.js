const express = require("express");
const router = express.Router();
const {
  addTopic,
  getTopicsByChapter,
  updateTopic,
  deleteTopic,
  addBulkTopics, // Import this
} = require("../controllers/topicController");

router.post("/add", addTopic);
router.post("/add-bulk", addBulkTopics); // New Route
router.get("/chapter/:chapterId", getTopicsByChapter);
router.put("/:id", updateTopic);
router.delete("/:id", deleteTopic);

module.exports = router;
