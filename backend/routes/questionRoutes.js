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
  getQuestionFilters, // ✅ 1. Import New Controller Function
} = require("../controllers/questionController");

// Import Middleware
const { protect, hasPermission } = require("../middleware/authMiddleware");

// ✅ Apply Protection (User must be logged in for all routes)
router.use(protect);

// --- ROUTES ---

// ✅ 2. NEW ROUTE: Fetch Categories & Difficulties (Metadata)
// Yeh route Frontend ke QuestionMenu mein dropdowns fill karega
router.get("/filters", getQuestionFilters);

// READ (Existing Filter Logic for fetching actual questions)
router.get("/filter", getQuestionsByFilter);

// READ (Get questions by topic ID)
router.get("/topic/:topicId", getQuestionsByTopic);

// --- WRITE OPERATIONS (Admin/Manager Only) ---

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
