const express = require("express");
const router = express.Router();
const {
  addTopic,
  getTopicsByChapter,
  updateTopic,
  deleteTopic,
} = require("../controllers/topicController");

// Create
router.post("/add", addTopic);

// Read (Specific Chapter ke topics lene ke liye)
router.get("/chapter/:chapterId", getTopicsByChapter);

// Update
router.put("/:id", updateTopic);

// Delete
router.delete("/:id", deleteTopic);

module.exports = router;
