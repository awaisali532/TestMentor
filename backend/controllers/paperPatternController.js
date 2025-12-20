const ExamBlueprint = require("../models/ExamBlueprint");

// 1. CREATE NEW PRESET
const createPattern = async (req, res) => {
  try {
    const {
      presetName,
      gradeLevel,
      subjects,
      type,
      totalMarks,
      timeAllowed,
      sections,
      isSystemPreset,
    } = req.body;

    if (!presetName || !gradeLevel || !subjects || !totalMarks || !sections) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    // 🔥 SECURITY LOGIC:
    // Agar user Admin nahi hai, to wo System Preset nahi bana sakta
    let systemFlag = false;
    if (req.user.role === "admin") {
      systemFlag = isSystemPreset || false;
    }

    // Check Duplicate (Apne hi presets mein)
    const existing = await ExamBlueprint.findOne({
      presetName,
      createdBy: req.user._id,
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "You already have a preset with this name!" });
    }

    const newPattern = new ExamBlueprint({
      presetName,
      gradeLevel,
      subjects,
      type,
      totalMarks,
      timeAllowed,
      sections,
      isSystemPreset: systemFlag, // ✅ Logic applied
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
      return res.status(400).json({ error: "Preset Name must be unique" });
    }
    res.status(500).json({ error: error.message || "Server Error" });
  }
};

// 2. GET ALL PATTERNS (Admin + Own)
const getAllPatterns = async (req, res) => {
  try {
    const { grade, subject, type } = req.query;
    let query = {};

    if (grade) query.gradeLevel = { $in: [grade] };
    if (subject) query.subjects = { $in: [subject] };
    if (type) query.type = type;

    // 🔥 LOGIC: Show System Presets OR My Own Presets
    query.$or = [
      { isSystemPreset: true }, // Admin wale sabko dikhao
      { createdBy: req.user._id }, // Apne wale khud ko dikhao
    ];

    const patterns = await ExamBlueprint.find(query).sort({ createdAt: -1 });
    res.json(patterns);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch patterns" });
  }
};

// 3. GET SINGLE
const getPatternById = async (req, res) => {
  try {
    const pattern = await ExamBlueprint.findById(req.params.id);
    if (!pattern) return res.status(404).json({ error: "Pattern not found" });
    res.json(pattern);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// 4. DELETE PATTERN
const deletePattern = async (req, res) => {
  try {
    const pattern = await ExamBlueprint.findById(req.params.id);
    if (!pattern) return res.status(404).json({ error: "Pattern not found" });

    // Permission Check: Owner or Admin
    if (
      pattern.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this preset" });
    }

    await pattern.deleteOne();
    res.json({ message: "Pattern deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete pattern" });
  }
};

// 5. UPDATE PATTERN
const updatePattern = async (req, res) => {
  try {
    const { id } = req.params;
    const pattern = await ExamBlueprint.findById(id);

    if (!pattern) return res.status(404).json({ error: "Pattern not found" });

    // Permission Check
    if (
      pattern.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this preset" });
    }

    // Prevent making it system preset if not admin
    if (req.body.isSystemPreset === true && req.user.role !== "admin") {
      req.body.isSystemPreset = false;
    }

    const updatedPattern = await ExamBlueprint.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
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
