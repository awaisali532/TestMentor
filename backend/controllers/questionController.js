const Question = require("../models/question");
const Topic = require("../models/topic");
const Subject = require("../models/subjectModel"); // Required for Wizard Filter
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ==========================================
// 1. GET ALL (ADMIN PANEL - SAFE MODE)
// ==========================================
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 2. GET MENU QUESTIONS (FOR USER SIDE - FLEXIBLE)
// ==========================================
const getMenuQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("topics", "name topicNumber")
      .populate("chapter", "name chapterNumber")
      .sort({ createdAt: -1 })
      .lean();

    const formattedQuestions = questions.map((q) => ({
      ...q,
      menuContext: "user_view",
      canEdit: true,
    }));

    res.status(200).json({
      success: true,
      data: formattedQuestions,
    });
  } catch (err) {
    console.error("Menu Error:", err);
    res.status(500).json({ error: "Failed to fetch menu questions" });
  }
};

// ==========================================
// 3. GET FILTERS (METADATA FOR DROPDOWNS)
// ==========================================
const getQuestionFilters = async (req, res) => {
  try {
    const categories = Question.schema.path("questionCategory").enumValues;
    const difficulties = Question.schema.path("difficulty").enumValues;

    res.status(200).json({
      success: true,
      categories,
      difficulties,
    });
  } catch (error) {
    console.error("Metadata Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch filters" });
  }
};

// ==========================================
// 4. GET QUESTIONS BY FILTER (WIZARD LOGIC - FIXED)
// ==========================================
// questionController.js

// ==========================================
// 4. GET QUESTIONS BY FILTER (WIZARD LOGIC - DEBUGGED)
// ==========================================
const getQuestionsByFilter = async (req, res) => {
  try {
    console.log("🔍 API HIT: /filter");
    console.log("👉 Query Params Received:", req.query);

    const { grade, subject, type } = req.query;

    // ✅ FIX: Handle keys with brackets (category[] vs category)
    // Axios aksar arrays ko 'key[]' ke naam se bhejta hai
    const rawCategory = req.query.category || req.query["category[]"];
    const rawDifficulty = req.query.difficulty || req.query["difficulty[]"];
    const rawTopics = req.query.topics || req.query["topics[]"];

    if (!grade || !subject) {
      return res.status(400).json({ error: "Grade and Subject are required" });
    }

    // 1. Find Subject
    const subjectDoc = await Subject.findOne({
      className: grade,
      subjectName: subject,
    });

    if (!subjectDoc) {
      console.log("❌ Subject Not Found:", grade, subject);
      return res.status(404).json({ error: "Subject not found" });
    }

    // 2. Build Query
    let query = { subject: subjectDoc._id };

    // --- TYPE ---
    if (type && type !== "ALL") {
      query.type = type;
    }

    // ✅ Helper to normalize to Array
    const normalizeArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [val]; // Convert single string to array
    };

    // --- CATEGORY ---
    const catArray = normalizeArray(rawCategory);
    if (catArray.length > 0) {
      query.questionCategory = { $in: catArray };
    }

    // --- DIFFICULTY ---
    const diffArray = normalizeArray(rawDifficulty);
    if (diffArray.length > 0) {
      query.difficulty = { $in: diffArray };
    }

    // --- TOPICS ---
    const topicArray = normalizeArray(rawTopics);
    if (topicArray.length > 0) {
      query.topics = { $in: topicArray };
    }

    console.log("🛠️ FINAL MONGO QUERY:", JSON.stringify(query, null, 2));

    // 3. Execute
    const questions = await Question.find(query)
      .populate("topics", "name topicNumber")
      .populate("chapter", "name chapterNumber")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${questions.length} questions`);

    // 4. Send
    const formattedQuestions = questions.map((q) => ({
      ...q,
      menuContext: "filter_api",
    }));

    res.status(200).json(formattedQuestions);
  } catch (err) {
    console.error("❌ Filter Error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

// ==========================================
// 5. ADD QUESTION
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

    if (!subjectId || subjectId === "undefined")
      return res.status(400).json({ error: "Subject ID missing." });
    if (!classLevel || classLevel === "undefined")
      return res.status(400).json({ error: "Class Level missing." });

    let parsedTopics = [];
    if (topics) {
      try {
        parsedTopics = JSON.parse(topics);
      } catch (e) {
        parsedTopics = Array.isArray(topics) ? topics : [topics];
      }
    }

    if (!parsedTopics || parsedTopics.length === 0 || !type) {
      return res.status(400).json({ error: "Topic and Type are required" });
    }

    let parsedStatement = statement
      ? JSON.parse(statement)
      : { en: "", ur: "" };
    let parsedOptions = options ? JSON.parse(options) : [];
    let parsedTags = boardTags ? JSON.parse(boardTags) : [];

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
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 6. UPDATE QUESTION
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
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 7. DELETE QUESTION
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
// 8. UTILITY FUNCTIONS
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

    if (formattedQuestions.length === 0)
      return res
        .status(400)
        .json({ error: "No questions mapped", details: errors });

    await Question.insertMany(formattedQuestions);
    res.status(201).json({
      message: `${formattedQuestions.length} Questions added!`,
      warnings: errors.length > 0 ? errors : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

module.exports = {
  getAllQuestions,
  getMenuQuestions,
  getQuestionFilters,
  getQuestionsByFilter,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTopic,
  addBulkQuestions,
  deleteQuestionsBulk,
  deleteAllQuestionsInTopic,
};
