const SavedPaper = require("../models/SavedPaper");

// 1. Save New Paper
const savePaper = async (req, res) => {
  try {
    const { title, subject, grade, totalMarks, pattern, questions } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: "No questions" });
    }

    const newPaper = new SavedPaper({
      user: req.user.id, // Auth Middleware se aayega
      title,
      subject,
      grade,
      totalMarks,
      paperPattern: pattern, // Frontend 'pattern' bhejta hai, Model 'paperPattern' mangta hai
      questions: questions,
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

// 2. Get All User Papers
const getMyPapers = async (req, res) => {
  try {
    const papers = await SavedPaper.find({ user: req.user.id })
      .select("title subject grade totalMarks createdAt") // Sirf zaroori fields lo
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

// ✅ 4. UPDATE PAPER (New Function)
const updatePaper = async (req, res) => {
  try {
    const paperId = req.params.id;
    const { title, questions, totalMarks, pattern } = req.body;

    // 1. Paper dhoondo aur check karo ke user wahi hai
    let paper = await SavedPaper.findOne({ _id: paperId, user: req.user.id });

    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper not found or unauthorized" });
    }

    // 2. Fields Update karo
    paper.title = title || paper.title;
    paper.questions = questions || paper.questions;
    paper.totalMarks = totalMarks || paper.totalMarks;

    if (pattern) {
      paper.paperPattern = pattern;
    }

    // 3. Save Updated Paper
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

// ✅ EXPORTS UPDATE (Ab updatePaper bhi export ho raha hai)
module.exports = {
  savePaper,
  getMyPapers,
  getPaperById,
  updatePaper,
};
