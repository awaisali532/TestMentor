const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, hasPermission } = require("../middleware/authMiddleware");

// Import Controllers
const {
  getAllQuestions,
  getMenuQuestions,
  getQuestionFilters,
  getQuestionsByFilter, // ✅ Yeh wohi function hai
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTopic,
  addBulkQuestions,
  deleteQuestionsBulk,
  deleteAllQuestionsInTopic,
  getQuestionsByChapter,
} = require("../controllers/questionController");

// Apply Protection (All routes require login)
router.use(protect);

// =======================
// READ OPERATIONS
// =======================

router.get("/filters", getQuestionFilters);
router.get("/menu-data", getMenuQuestions);

// 🔥 CHANGE: GET -> POST (To handle large syllabus arrays)
router.post("/filter", getQuestionsByFilter);

router.get("/", getAllQuestions);
router.get("/topic/:topicId", getQuestionsByTopic);
router.get("/chapter/:chapterId", getQuestionsByChapter);

// =======================
// WRITE OPERATIONS
// =======================
router.post(
  "/add",
  hasPermission("manage_questions"),
  upload.single("image"),
  addQuestion,
);
router.post("/bulk-add", hasPermission("manage_questions"), addBulkQuestions);
router.post(
  "/delete-bulk",
  hasPermission("manage_questions"),
  deleteQuestionsBulk,
);
router.delete(
  "/topic/:topicId/delete-all",
  hasPermission("manage_questions"),
  deleteAllQuestionsInTopic,
);
router.put(
  "/:id",
  hasPermission("manage_questions"),
  upload.single("image"),
  updateQuestion,
);
router.delete("/:id", hasPermission("manage_questions"), deleteQuestion);

module.exports = router;
