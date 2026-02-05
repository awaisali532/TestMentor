const PaperPattern = require("../models/PaperPattren.js");
const Subject = require("../models/subjectModel");

// =================================================
// 1. CREATE NEW PATTERN
// =================================================
const createPattern = async (req, res) => {
  try {
    const {
      name,
      category, // ✅ Receive Category
      gradeLevel,
      subject,
      totalMarks,
      timeAllowed,
      sections,
      isPairingSpecific,
      isSystemPreset,
    } = req.body;

    if (!name || !gradeLevel || !subject || !totalMarks || !sections) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    let systemFlag = false;
    if (req.user && req.user.role === "admin") {
      systemFlag = isSystemPreset || false;
    }

    const existing = await PaperPattern.findOne({
      name,
      createdBy: req.user._id,
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "You already have a pattern with this name!" });
    }

    const newPattern = new PaperPattern({
      name,
      category: category || "GENERAL", // ✅ Set Default if missing
      gradeLevel,
      subject,
      totalMarks,
      timeAllowed,
      isPairingSpecific: isPairingSpecific || false,
      sections,
      isSystemPreset: systemFlag,
      createdBy: req.user._id,
    });

    const savedPattern = await newPattern.save();

    res.status(201).json({
      message: "Paper Pattern Created Successfully",
      data: savedPattern,
    });
  } catch (error) {
    console.error("Create Pattern Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Pattern Name must be unique" });
    }
    res.status(500).json({ error: error.message || "Server Error" });
  }
};

// =================================================
// 2. GET ALL PATTERNS (✅ UPDATED FOR CATEGORY)
// =================================================
const getAllPatterns = async (req, res) => {
  try {
    const { grade, subject, category } = req.query; // ✅ Receive Category Query
    let query = {};

    if (grade) query.gradeLevel = grade;

    // ✅ Filter by Category if provided (e.g. FULL_BOOK)
    if (category) query.category = category;

    // Check if subject is Name or ID
    if (subject) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(subject);

      if (isValidObjectId) {
        query.subject = subject;
      } else {
        const subjectDoc = await Subject.findOne({
          $or: [{ subjectName: subject }, { name: subject }],
        });

        if (!subjectDoc) {
          return res.json([]);
        }
        query.subject = subjectDoc._id;
      }
    }

    // Admin wale (System) + Mere Apne
    query.$or = [{ isSystemPreset: true }, { createdBy: req.user._id }];

    const patterns = await PaperPattern.find(query)
      .populate("subject", "name subjectName")
      .sort({ createdAt: -1 });

    res.json(patterns);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch patterns" });
  }
};

// =================================================
// 3. GET SINGLE PATTERN
// =================================================
const getPatternById = async (req, res) => {
  try {
    const pattern = await PaperPattern.findById(req.params.id)
      .populate("subject", "name subjectName")
      .populate({
        path: "sections.linkedChapters",
        select: "name chapterNumber",
      })
      .populate({
        path: "sections.subQuestions.linkedChapters",
        select: "name chapterNumber",
      });

    if (!pattern) return res.status(404).json({ error: "Pattern not found" });
    res.json(pattern);
  } catch (error) {
    console.error("Get Single Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// =================================================
// 4. DELETE PATTERN
// =================================================
const deletePattern = async (req, res) => {
  try {
    const pattern = await PaperPattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ error: "Pattern not found" });

    if (
      pattern.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this pattern" });
    }

    await pattern.deleteOne();
    res.json({ message: "Pattern deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete pattern" });
  }
};

// =================================================
// 5. UPDATE PATTERN
// =================================================
const updatePattern = async (req, res) => {
  try {
    const { id } = req.params;
    const pattern = await PaperPattern.findById(id);

    if (!pattern) return res.status(404).json({ error: "Pattern not found" });

    if (
      pattern.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this pattern" });
    }

    if (req.body.isSystemPreset === true && req.user.role !== "admin") {
      req.body.isSystemPreset = false;
    }

    const updatedPattern = await PaperPattern.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true, // ✅ Ensures ENUM validation works
    });

    res.json({ message: "Pattern Updated Successfully", data: updatedPattern });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPattern,
  getAllPatterns,
  getPatternById,
  deletePattern,
  updatePattern,
};
