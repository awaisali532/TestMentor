const SavedPaper = require("../models/savedPaper");

// 1. Save New Paper
const savePaper = async (req, res) => {
  try {
    const {
      title,
      subject,
      grade,
      totalMarks,
      pattern,
      questions,
      examLabel,
      examDate,
      syllabusLabel,
    } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: "No questions" });
    }

    const newPaper = new SavedPaper({
      user: req.user.id,
      title,
      subject,
      grade,
      totalMarks,
      paperPattern: pattern,
      questions: questions,
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
    console.error("Save Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. Get All User Papers (✅ FIX HERE)
const getMyPapers = async (req, res) => {
  try {
    const papers = await SavedPaper.find({ user: req.user.id })
      .select(
        // 👇 Maine yahan 'examDate' add kar diya hai
        "title subject grade totalMarks examLabel examDate syllabusLabel createdAt"
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, papers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. Get Single Paper by ID
const getPaperById = async (req, res) => {
  try {
    const paper = await SavedPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ msg: "Not Found" });
    res.json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 4. UPDATE PAPER (✅ FIX HERE ALSO)
const updatePaper = async (req, res) => {
  try {
    const paperId = req.params.id;

    // ✅ ADDED: examDate receive kar rahe hain
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

    // Fields Update
    paper.title = title || paper.title;
    paper.questions = questions || paper.questions;
    paper.totalMarks = totalMarks || paper.totalMarks;

    // Update Labels
    if (examLabel !== undefined) paper.examLabel = examLabel;
    if (syllabusLabel !== undefined) paper.syllabusLabel = syllabusLabel;

    // ✅ ADDED: Date Update Logic
    if (examDate !== undefined) paper.examDate = examDate;

    if (pattern) {
      paper.paperPattern = pattern;
    }

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

// 5. DELETE PAPER
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
