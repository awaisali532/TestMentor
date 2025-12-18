const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  addQuestion,
  getQuestionsByFilter,
  getQuestionsByTopic,
  deleteQuestion,
  updateQuestion,
  addBulkQuestions,
  deleteQuestionsBulk,
  deleteAllQuestionsInTopic,
} = require("../controllers/questionController");

// Import Middleware
const { protect, hasPermission } = require("../middleware/authMiddleware");

// ✅ 1. Apply Protection (User must be logged in)
router.use(protect);
router.get("/filter", protect, getQuestionsByFilter);
// --- ROUTES ---

// READ (Allowed for all logged in users, e.g. Teachers generating papers)
router.get("/topic/:topicId", getQuestionsByTopic);

// WRITE (Requires 'manage_questions' permission OR Super Admin)
router.post(
  "/add",
  hasPermission("manage_questions"),
  upload.single("image"),
  addQuestion
);
router.post("/bulk-add", hasPermission("manage_questions"), addBulkQuestions);
router.post(
  "/delete-bulk",
  hasPermission("manage_questions"),
  deleteQuestionsBulk
);
router.delete(
  "/topic/:topicId/delete-all",
  hasPermission("manage_questions"),
  deleteAllQuestionsInTopic
);
router.put(
  "/:id",
  hasPermission("manage_questions"),
  upload.single("image"),
  updateQuestion
);
router.delete("/:id", hasPermission("manage_questions"), deleteQuestion);

module.exports = router;
