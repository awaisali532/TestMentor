const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, hasPermission } = require("../middleware/authMiddleware");

// Import Controllers
const {
  getAllQuestions,
  getMenuQuestions,
  getQuestionFilters,
  getQuestionsByFilter,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTopic,
  addBulkQuestions,
  deleteQuestionsBulk,
  deleteAllQuestionsInTopic,
} = require("../controllers/questionController");

// Apply Protection (All routes require login)
router.use(protect);

// =======================
// READ OPERATIONS (GET)
// =======================

// 1. Fetch Categories & Difficulties (For Dropdowns)
router.get("/filters", getQuestionFilters);

// 2. NEW ROUTE: Fetch Data for User Menu (Flexible/Editable)
router.get("/menu-data", getMenuQuestions);

// 3. Fetch Questions based on Filters (Wizard: ?grade=X&subject=Y)
router.get("/filter", getQuestionsByFilter);

// 4. Fetch All Questions (For Admin Panel Table)
router.get("/", getAllQuestions);

// 5. Fetch Questions by Topic ID
router.get("/topic/:topicId", getQuestionsByTopic);

// =======================
// WRITE OPERATIONS (Admin/Manager Only)
// =======================

// Add Single Question
router.post(
  "/add",
  hasPermission("manage_questions"),
  upload.single("image"),
  addQuestion
);

// Add Bulk Questions
router.post("/bulk-add", hasPermission("manage_questions"), addBulkQuestions);

// Delete Bulk Questions
router.post(
  "/delete-bulk",
  hasPermission("manage_questions"),
  deleteQuestionsBulk
);

// Delete All in Topic
router.delete(
  "/topic/:topicId/delete-all",
  hasPermission("manage_questions"),
  deleteAllQuestionsInTopic
);

// Update Question
router.put(
  "/:id",
  hasPermission("manage_questions"),
  upload.single("image"),
  updateQuestion
);

// Delete Single Question
router.delete("/:id", hasPermission("manage_questions"), deleteQuestion);

module.exports = router;
