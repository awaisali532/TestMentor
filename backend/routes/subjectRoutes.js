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

// ==========================================
// ✅ 1. SPECIFIC ROUTES (Classes) - YEH PEHLE AAYENGE
// ==========================================
// Inko sabse upar rakhna zaroori hai taaki "classes" ko koi ID na samjhe

router.get("/classes/all", getClassLevels); // GET All Classes
router.post("/classes/add", addClassLevel); // Add Class
router.put("/classes/:id", updateClassLevel); // Edit Class
router.delete("/classes/:id", deleteClassLevel);
// ==========================================
// ✅ 2. SUBJECT ROUTES (General)
// ==========================================

router.post("/add", upload.single("image"), addSubject);
router.get("/", getSubjects);

// ==========================================
// ⚠️ 3. DYNAMIC ID ROUTES (Sabse End Mein)
// ==========================================
// Yeh "Net" ki tarah hain, jo bacha kucha hoga wo yahan pakra jayega.
// Agar inko upar rakha to "/classes/all" block ho jayega.

router.get("/:id", getSubjectById);
router.put("/:id", upload.single("image"), updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
