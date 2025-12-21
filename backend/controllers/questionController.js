const Question = require("../models/question");
const Topic = require("../models/topic");
// ✅ NEW IMPORT (Zaroori hai filter ke liye)
const Subject = require("../models/subjectModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ==========================================
// ✅ 1. NEW FUNCTION: FILTER FOR WIZARD
// ==========================================
const getQuestionsByFilter = async (req, res) => {
  try {
    // Frontend sends: ?grade=9th Class&subject=Physics
    const { grade, subject } = req.query;

    // 1. Find Subject ID
    const subjectDoc = await Subject.findOne({
      className: grade,
      subjectName: subject,
    });

    if (!subjectDoc) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // 2. Find Questions directly by Subject ID
    // Hum "topics" aur "chapter" ko populate kar rahe hain taake frontend par groupings ban sakein
    const questions = await Question.find({ subject: subjectDoc._id })
      .populate("topics", "name topicNumber") // Populate Topics
      .populate("chapter", "name chapterNumber") // Populate Chapter
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    console.error("Filter Error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

// ==========================================
// 2. ADD QUESTION (Existing Logic)
// ==========================================
const addQuestion = async (req, res) => {
  try {
    const {
      topics,
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

    // Safety Checks
    if (!subjectId || subjectId === "undefined") {
      return res
        .status(400)
        .json({ error: "System Error: Subject ID is missing." });
    }
    if (!classLevel || classLevel === "undefined") {
      return res
        .status(400)
        .json({ error: "System Error: Class Level is missing." });
    }

    // Handle Topics Input
    let parsedTopics = [];
    if (topics) {
      try {
        parsedTopics = JSON.parse(topics);
      } catch (e) {
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
      topics: parsedTopics,
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

// ==========================================
// 3. GET QUESTIONS BY TOPIC (Existing)
// ==========================================
const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const questions = await Question.find({ topics: topicId }).sort({
      createdAt: -1,
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 4. DELETE QUESTION (Existing)
// ==========================================
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

// ==========================================
// 5. UPDATE QUESTION (Existing)
// ==========================================
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      topics,
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

    let updatedTopics = question.topics;
    if (topics) {
      try {
        updatedTopics = JSON.parse(topics);
      } catch (e) {
        updatedTopics = Array.isArray(topics) ? topics : [topics];
      }
    }

    let updateData = {
      topics: updatedTopics,
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

// ==========================================
// 6. BULK ADD (Existing)
// ==========================================
const addBulkQuestions = async (req, res) => {
  try {
    const { questions, chapterId, subjectId, classLevel } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Invalid data format." });
    }

    const chapterTopics = await Topic.find({ chapter: chapterId });
    const topicMap = {};
    chapterTopics.forEach((t) => {
      topicMap[t.topicNumber] = t._id;
    });

    const formattedQuestions = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      let assignedTopicIds = [];

      if (q.topics && Array.isArray(q.topics)) {
        q.topics.forEach((num) => {
          if (topicMap[num]) assignedTopicIds.push(topicMap[num]);
          else console.warn(`Topic Number ${num} not found`);
        });
      }

      if (assignedTopicIds.length === 0) {
        errors.push(`Question #${i + 1}: No valid topics found`);
        continue;
      }

      formattedQuestions.push({
        ...q,
        topics: assignedTopicIds,
        chapter: chapterId,
        subject: subjectId,
        classLevel: classLevel,
        difficulty: q.difficulty || "Medium",
        type: q.type || "MCQ",
        questionCategory: q.questionCategory || "TEXT",
      });
    }

    if (formattedQuestions.length === 0) {
      return res
        .status(400)
        .json({ error: "No questions mapped", details: errors });
    }

    await Question.insertMany(formattedQuestions);
    res.status(201).json({
      message: `${formattedQuestions.length} Questions added!`,
      warnings: errors.length > 0 ? errors : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 7. DELETE BULK (Existing)
// ==========================================
const deleteQuestionsBulk = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0)
      return res.status(400).json({ error: "No questions selected" });

    const questions = await Question.find({ _id: { $in: ids } });
    for (const q of questions) {
      if (q.image && q.image.public_id)
        await cloudinary.uploader.destroy(q.image.public_id);
    }

    await Question.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Selected questions deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 8. DELETE ALL IN TOPIC (Existing)
// ==========================================
const deleteAllQuestionsInTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const questions = await Question.find({ topics: topicId });

    if (questions.length === 0)
      return res.status(404).json({ error: "No questions found" });

    for (const q of questions) {
      if (q.image && q.image.public_id)
        await cloudinary.uploader.destroy(q.image.public_id);
    }

    await Question.deleteMany({ topics: topicId });
    res.json({ message: "All questions in topic deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Get Filters (Categories & Difficulties) directly from Schema
const getQuestionFilters = async (req, res) => {
  try {
    // Mongoose Schema se Enum values nikalne ka tareeqa
    const categories = Question.schema.path("questionCategory").enumValues;
    const difficulties = Question.schema.path("difficulty").enumValues;

    res.status(200).json({
      success: true,
      categories, // ["TEXT", "EXERCISE", ...]
      difficulties, // ["Easy", "Medium", "Hard"]
    });
  } catch (error) {
    console.error("Metadata Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch filters" });
  }
};
// ✅ EXPORT ALL
module.exports = {
  addQuestion,
  getQuestionsByFilter, // ✅ New Export
  getQuestionsByTopic,
  deleteQuestion,
  updateQuestion,
  addBulkQuestions,
  deleteQuestionsBulk,
  deleteAllQuestionsInTopic,
  getQuestionFilters,
};
