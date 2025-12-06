const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  addQuestion,
  getQuestionsByTopic,
  deleteQuestion,
  updateQuestion,
  addBulkQuestions,
} = require("../controllers/questionController");

router.post("/bulk-add", addBulkQuestions);
// Create
router.post("/add", upload.single("image"), addQuestion);

// Read (By Topic)
router.get("/topic/:topicId", getQuestionsByTopic);

// Update
router.put("/:id", upload.single("image"), updateQuestion);

// Delete
router.delete("/:id", deleteQuestion);

module.exports = router;
