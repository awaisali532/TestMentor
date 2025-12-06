const Question = require("../models/question"); // Capital 'Q' check krna file name ke hisab se
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// 1. ADD QUESTION (Updated with Safety Checks)
const addQuestion = async (req, res) => {
  try {
    const {
      topicId,
      chapterId,
      subjectId,
      classLevel,
      type,
      difficulty,
      marks,
      important,
      boardTags,
      statement,
      options,
      questionCategory,
    } = req.body;

    // 🚨 SAFETY CHECK (Yeh error rokega)
    if (!subjectId || subjectId === "undefined") {
      return res
        .status(400)
        .json({
          error:
            "System Error: Subject ID is missing. Please refresh and try again.",
        });
    }
    if (!classLevel || classLevel === "undefined") {
      return res
        .status(400)
        .json({ error: "System Error: Class Level is missing." });
    }

    let parsedStatement = statement
      ? JSON.parse(statement)
      : { en: "", ur: "" };
    let parsedOptions = options ? JSON.parse(options) : [];
    let parsedTags = boardTags ? JSON.parse(boardTags) : [];

    if (!topicId || !type) {
      return res.status(400).json({ error: "Topic and Type are required" });
    }

    // Image Handling
    let imageData = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "questions_images",
      });
      imageData = { url: result.secure_url, public_id: result.public_id };
      fs.unlinkSync(req.file.path);
    }

    const newQuestion = new Question({
      topic: topicId,
      chapter: chapterId,
      subject: subjectId, // Ab ye safe hai
      classLevel,
      type,
      questionCategory: questionCategory || "TEXT",
      difficulty,
      marks,
      important: important === "true",
      boardTags: parsedTags,
      statement: parsedStatement,
      options: parsedOptions,
      image: imageData,
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("Add Question Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// 2. GET QUESTIONS
const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const questions = await Question.find({ topic: topicId }).sort({
      createdAt: -1,
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. DELETE QUESTION
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    if (question.image && question.image.public_id) {
      await cloudinary.uploader.destroy(question.image.public_id);
    }

    await Question.findByIdAndDelete(id);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. UPDATE QUESTION
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      difficulty,
      marks,
      important,
      boardTags,
      statement,
      options,
      questionCategory, // <--- NEW INPUT
    } = req.body;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: "Not found" });

    let updateData = {
      type,
      difficulty,
      marks,
      questionCategory, // <--- Updating Category
      important: important === "true",
      boardTags: boardTags ? JSON.parse(boardTags) : question.boardTags,
      statement: statement ? JSON.parse(statement) : question.statement,
      options: options ? JSON.parse(options) : question.options,
    };

    if (req.file) {
      if (question.image && question.image.public_id) {
        await cloudinary.uploader.destroy(question.image.public_id);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "questions_images",
      });
      updateData.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      fs.unlinkSync(req.file.path);
    }

    const updatedQ = await Question.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json(updatedQ);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("Update Question Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 5. BULK ADD
const addBulkQuestions = async (req, res) => {
  try {
    const { questions, topicId, chapterId, subjectId, classLevel } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Invalid data format." });
    }

    const formattedQuestions = questions.map((q) => ({
      ...q,
      topic: topicId,
      chapter: chapterId,
      subject: subjectId,
      classLevel: classLevel,
      difficulty: q.difficulty || "Medium",
      type: q.type || "MCQ",
      questionCategory: q.questionCategory || "TEXT", // <--- Bulk mein bhi support
    }));

    await Question.insertMany(formattedQuestions);
    res
      .status(201)
      .json({ message: `${formattedQuestions.length} Questions added!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addQuestion,
  getQuestionsByTopic,
  deleteQuestion,
  updateQuestion,
  addBulkQuestions,
};
