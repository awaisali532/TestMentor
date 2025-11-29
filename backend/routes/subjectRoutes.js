const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // Multer Import kiya

const {
  addSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController.js");

// YAHAN CHANGE HAI: 'upload.single('image')' add kiya
// 'image' wahi naam hona chahiye jo tumne Frontend FormData mein .append('image', file) kiya tha
router.post("/add", upload.single("image"), addSubject);

router.get("/", getSubjects);
router.get("/:id", getSubjectById);
router.put("/:id", upload.single("image"), updateSubject); // Update mein bhi image ho sakti hai, future mein yahan bhi lagana
router.delete("/:id", deleteSubject);

module.exports = router;
