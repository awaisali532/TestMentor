const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  addSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  addClassLevel,
  getClassLevels,
  updateClassLevel,
  deleteClassLevel,
} = require("../controllers/subjectController.js");

// Import Middleware
const { protect, hasPermission } = require("../middleware/authMiddleware");

// ✅ 1. Apply Protection
router.use(protect);

// ==========================================
// ✅ 1. SPECIFIC ROUTES (Classes)
// ==========================================

// Read Classes (Open to all logged in)
router.get("/classes/all", getClassLevels);

// Manage Classes (Restricted)
router.post("/classes/add", hasPermission("manage_subjects"), addClassLevel);
router.put("/classes/:id", hasPermission("manage_subjects"), updateClassLevel);
router.delete(
  "/classes/:id",
  hasPermission("manage_subjects"),
  deleteClassLevel
);

// ==========================================
// ✅ 2. SUBJECT ROUTES (General)
// ==========================================

// Read Subjects (Open to all)
router.get("/", getSubjects);

// Add Subject (Restricted)
router.post(
  "/add",
  hasPermission("manage_subjects"),
  upload.single("image"),
  addSubject
);

// ==========================================
// ⚠️ 3. DYNAMIC ID ROUTES
// ==========================================

router.get("/:id", getSubjectById); // Read specific subject

// Update/Delete Subject (Restricted)
router.put(
  "/:id",
  hasPermission("manage_subjects"),
  upload.single("image"),
  updateSubject
);
router.delete("/:id", hasPermission("manage_subjects"), deleteSubject);

module.exports = router;
