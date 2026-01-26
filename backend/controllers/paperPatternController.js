const PaperPattern = require("../models/PaperPattren.js");

// 1. CREATE NEW PATTERN
const createPattern = async (req, res) => {
  try {
    const {
      name, // Changed from presetName to name
      gradeLevel,
      subject, // Changed from subjects[] to single subject ID
      totalMarks,
      timeAllowed,
      sections, // Iske andar linkedChapters aur subQuestions honge
      isPairingSpecific, // New Flag
      isSystemPreset,
    } = req.body;

    // Basic Validation
    if (!name || !gradeLevel || !subject || !totalMarks || !sections) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    // 🔥 SECURITY LOGIC:
    // Sirf Admin hi 'System Preset' bana sakta hai
    let systemFlag = false;
    if (req.user && req.user.role === "admin") {
      systemFlag = isSystemPreset || false;
    }

    // Check Duplicate (Name + Creator)
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
      gradeLevel,
      subject,
      totalMarks,
      timeAllowed,
      isPairingSpecific: isPairingSpecific || false,
      sections, // Frontend se pura structured array ayega
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

// 2. GET ALL PATTERNS (For List View)
const getAllPatterns = async (req, res) => {
  try {
    const { grade, subject } = req.query;
    let query = {};

    if (grade) query.gradeLevel = grade;
    if (subject) query.subject = subject; // Exact ID Match

    // 🔥 LOGIC: Admin wale (System) + Mere Apne
    query.$or = [{ isSystemPreset: true }, { createdBy: req.user._id }];

    const patterns = await PaperPattern.find(query)
      .populate("subject", "name") // Subject ka naam dikhane ke liye
      .sort({ createdAt: -1 });

    res.json(patterns);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch patterns" });
  }
};

// 3. GET SINGLE PATTERN (Detailed View for Editing/Generating)
const getPatternById = async (req, res) => {
  try {
    const pattern = await PaperPattern.findById(req.params.id)
      .populate("subject", "name")
      // ✅ Deep Populate: Sections ke andar Linked Chapters ka naam chahiye
      .populate({
        path: "sections.linkedChapters",
        select: "name chapterNumber", // Sirf naam aur number lao
      })
      // ✅ Deep Populate: Agar SubQuestions (Parts) hain to unke chapters bhi lao
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

// 4. DELETE PATTERN
const deletePattern = async (req, res) => {
  try {
    const pattern = await PaperPattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ error: "Pattern not found" });

    // Permission Check
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

// 5. UPDATE PATTERN
const updatePattern = async (req, res) => {
  try {
    const { id } = req.params;
    const pattern = await PaperPattern.findById(id);

    if (!pattern) return res.status(404).json({ error: "Pattern not found" });

    // Permission Check
    if (
      pattern.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this pattern" });
    }

    // Security: Only Admin can set System Preset
    if (req.body.isSystemPreset === true && req.user.role !== "admin") {
      req.body.isSystemPreset = false;
    }

    const updatedPattern = await PaperPattern.findByIdAndUpdate(id, req.body, {
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
