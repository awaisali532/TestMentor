const Question = require("../models/question"); // Ensure casing matches file
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// 1. ADD QUESTION (Supports Multiple Topics)
const addQuestion = async (req, res) => {
  try {
    const {
      topics, // 🔄 Expecting Array of IDs (or single ID string)
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

    // 🚨 SAFETY CHECKS
    if (!subjectId || subjectId === "undefined") {
      return res.status(400).json({
        error: "System Error: Subject ID is missing. Please refresh.",
      });
    }
    if (!classLevel || classLevel === "undefined") {
      return res
        .status(400)
        .json({ error: "System Error: Class Level is missing." });
    }

    // 🔄 Handle Topics Input (Can be JSON string array or single ID)
    let parsedTopics = [];
    if (topics) {
      try {
        // If sent as JSON string ["ID1", "ID2"]
        parsedTopics = JSON.parse(topics);
      } catch (e) {
        // If sent as simple string "ID1" or already array
        parsedTopics = Array.isArray(topics) ? topics : [topics];
      }
    }

    if (!parsedTopics || parsedTopics.length === 0 || !type) {
      return res
        .status(400)
        .json({ error: "At least one Topic and Type are required" });
    }

    // Parse JSON fields
    let parsedStatement = statement
      ? JSON.parse(statement)
      : { en: "", ur: "" };
    let parsedOptions = options ? JSON.parse(options) : [];
    let parsedTags = boardTags ? JSON.parse(boardTags) : [];

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
      topics: parsedTopics, // 🔄 Save as Array
      chapter: chapterId,
      subject: subjectId,
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

// 2. GET QUESTIONS (Smart Filter)
const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    // 🔄 MAGIC QUERY: Finds questions where 'topics' array contains 'topicId'
    const questions = await Question.find({ topics: topicId }).sort({
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
      topics, // 🔄 New Input
      type,
      difficulty,
      marks,
      important,
      boardTags,
      statement,
      options,
      questionCategory,
    } = req.body;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: "Not found" });

    // 🔄 Handle Topics Update
    let updatedTopics = question.topics;
    if (topics) {
      try {
        updatedTopics = JSON.parse(topics);
      } catch (e) {
        updatedTopics = Array.isArray(topics) ? topics : [topics];
      }
    }

    let updateData = {
      topics: updatedTopics, // 🔄 Update Array
      type,
      difficulty,
      marks,
      questionCategory,
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
    // 🔄 Accept 'topics' (Array) OR 'topicId' (Single) for backward compatibility
    const { questions, topicId, topics, chapterId, subjectId, classLevel } =
      req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Invalid data format." });
    }

    // Determine the topics array
    let assignedTopics = [];
    if (topics && Array.isArray(topics)) {
      assignedTopics = topics;
    } else if (topicId) {
      assignedTopics = [topicId];
    } else {
      return res.status(400).json({ error: "Topic ID is required." });
    }

    const formattedQuestions = questions.map((q) => ({
      ...q,
      topics: assignedTopics, // 🔄 Assign Array
      chapter: chapterId,
      subject: subjectId,
      classLevel: classLevel,
      difficulty: q.difficulty || "Medium",
      type: q.type || "MCQ",
      questionCategory: q.questionCategory || "TEXT",
    }));

    await Question.insertMany(formattedQuestions);
    res
      .status(201)
      .json({ message: `${formattedQuestions.length} Questions added!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 6. DELETE SELECTED QUESTIONS (Bulk Delete)
const deleteQuestionsBulk = async (req, res) => {
  try {
    const { ids } = req.body; // Array of IDs

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "No questions selected" });
    }

    // Optional: Delete images from Cloudinary first
    const questions = await Question.find({ _id: { $in: ids } });
    for (const q of questions) {
      if (q.image && q.image.public_id) {
        await cloudinary.uploader.destroy(q.image.public_id);
      }
    }

    await Question.deleteMany({ _id: { $in: ids } });

    res.json({ message: "Selected questions deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. DELETE ALL QUESTIONS IN A TOPIC
const deleteAllQuestionsInTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    // Find questions that belong ONLY to this topic (optional logic)
    // OR simply delete all questions linked to this topic
    const questions = await Question.find({ topics: topicId });

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ error: "No questions found in this topic" });
    }

    // Cloudinary Cleanup
    for (const q of questions) {
      if (q.image && q.image.public_id) {
        await cloudinary.uploader.destroy(q.image.public_id);
      }
    }

    // Delete them
    await Question.deleteMany({ topics: topicId });

    res.json({ message: "All questions in this topic deleted successfully" });
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
  deleteQuestionsBulk, // ✅ Export this
  deleteAllQuestionsInTopic, // ✅ Export this
};
