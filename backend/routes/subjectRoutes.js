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
  getFullSubjectDetails,
} = require("../controllers/subjectController.js");

// Import Middleware
const { protect, hasPermission } = require("../middleware/authMiddleware");

// ==========================================
// 🔓 PUBLIC ROUTES (No Login Required)
// ==========================================
// Move these ABOVE 'router.use(protect)'

// Read Classes
router.get("/classes/all", getClassLevels);

// Read Subjects
router.get("/", getSubjects);
router.get("/:id/full-details", getFullSubjectDetails); // ✅ NEW ROUTE
router.get("/:id", getSubjectById);

// ==========================================
// 🔒 PROTECTED ROUTES (Login Required)
// ==========================================
// Everything below this line requires a token
router.use(protect);

// --- CLASS MANAGEMENT (Restricted) ---
router.post("/classes/add", hasPermission("manage_subjects"), addClassLevel);
router.put("/classes/:id", hasPermission("manage_subjects"), updateClassLevel);
router.delete(
  "/classes/:id",
  hasPermission("manage_subjects"),
  deleteClassLevel
);

// --- SUBJECT MANAGEMENT (Restricted) ---
router.post(
  "/add",
  hasPermission("manage_subjects"),
  upload.single("image"),
  addSubject
);
router.put(
  "/:id",
  hasPermission("manage_subjects"),
  upload.single("image"),
  updateSubject
);
router.delete("/:id", hasPermission("manage_subjects"), deleteSubject);

module.exports = router;
