const express = require("express");
const router = express.Router();
const {
  addSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController.js");

router.post("/add", addSubject);
router.get("/", getSubjects);
router.get("/:id", getSubjectById);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
