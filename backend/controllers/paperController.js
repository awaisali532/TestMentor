const SavedPaper = require("../models/savedPaper");

// =================================================
// 1. SAVE NEW PAPER
// =================================================
const savePaper = async (req, res) => {
  try {
    const {
      title,
      subject,
      grade,
      totalMarks,
      pattern, // Frontend sends 'pattern', DB maps to 'paperPattern'
      questions,
      examLabel,
      examDate,
      syllabusLabel,
    } = req.body;

    // --- Validation ---
    if (!questions || questions.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No questions provided in paper." });
    }

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Paper title is required." });
    }

    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated." });
    }

    const trimmedTitle = title.trim();

    // --- Duplicate Check (Case Insensitive) ---
    const existingPaper = await SavedPaper.findOne({
      user: req.user.id,
      title: { $regex: new RegExp(`^${trimmedTitle}$`, "i") },
    });

    if (existingPaper) {
      return res.status(400).json({
        success: false,
        message: `A paper named "${trimmedTitle}" already exists. Please choose a unique name.`,
      });
    }

    // --- Create Object ---
    const newPaper = new SavedPaper({
      user: req.user.id,
      title: trimmedTitle,
      subject, // Expecting ID String
      grade,
      totalMarks,
      paperPattern: pattern, // Full Object Snapshot
      questions: questions, // Full Object Snapshot
      examLabel: examLabel || "",
      syllabusLabel: syllabusLabel || "",
      examDate: examDate || null,
    });

    const saved = await newPaper.save();

    res.status(201).json({
      success: true,
      paperId: saved._id,
      message: "Paper Saved Successfully!",
    });
  } catch (error) {
    console.error("🔥 Save Paper Error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// =================================================
// 2. GET ALL PAPERS
// =================================================
const getMyPapers = async (req, res) => {
  try {
    const papers = await SavedPaper.find({ user: req.user.id })
      .select(
        "title subject grade totalMarks examLabel examDate syllabusLabel createdAt",
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, papers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =================================================
// 3. GET SINGLE PAPER
// =================================================
const getPaperById = async (req, res) => {
  try {
    const paper = await SavedPaper.findById(req.params.id);
    if (!paper)
      return res
        .status(404)
        .json({ success: false, message: "Paper not found" });
    res.json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =================================================
// 4. UPDATE PAPER
// =================================================
const updatePaper = async (req, res) => {
  try {
    const paperId = req.params.id;
    const {
      title,
      questions,
      totalMarks,
      pattern,
      examLabel,
      syllabusLabel,
      examDate,
    } = req.body;

    let paper = await SavedPaper.findOne({ _id: paperId, user: req.user.id });

    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper not found or unauthorized" });
    }

    // --- Duplicate Name Check (Only if name changed) ---
    if (title && title.trim().toLowerCase() !== paper.title.toLowerCase()) {
      const trimmedTitle = title.trim();
      const existing = await SavedPaper.findOne({
        user: req.user.id,
        title: { $regex: new RegExp(`^${trimmedTitle}$`, "i") },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Paper name "${trimmedTitle}" already exists.`,
        });
      }
      paper.title = trimmedTitle;
    }

    // --- Updating Fields ---
    if (questions && questions.length > 0) paper.questions = questions; // Update Snapshot

    // Fix: Allow 0 marks update (using undefined check instead of ||)
    if (totalMarks !== undefined) paper.totalMarks = totalMarks;

    if (examLabel !== undefined) paper.examLabel = examLabel;
    if (syllabusLabel !== undefined) paper.syllabusLabel = syllabusLabel;
    if (examDate !== undefined) paper.examDate = examDate;
    if (pattern) paper.paperPattern = pattern;

    await paper.save();

    res.json({
      success: true,
      message: "Paper Updated Successfully!",
      paperId: paper._id,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update paper" });
  }
};

// =================================================
// 5. DELETE PAPER
// =================================================
const deletePaper = async (req, res) => {
  try {
    const paperId = req.params.id;
    const paper = await SavedPaper.findOne({ _id: paperId, user: req.user.id });

    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper not found or unauthorized" });
    }

    await SavedPaper.findByIdAndDelete(paperId);
    res.json({ success: true, message: "Paper Deleted Successfully!" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  savePaper,
  getMyPapers,
  getPaperById,
  updatePaper,
  deletePaper,
};
