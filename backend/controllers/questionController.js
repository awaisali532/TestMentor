const Question = require("../models/question");
const Topic = require("../models/topic");
const Subject = require("../models/subjectModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ✅ IMPORT VECTORIZER
const { getEmbedding } = require("../utils/vectorizer");

// ✅ HELPER: Special characters ko escape karne ka function (CRITICAL FOR LATEX)
function escapeRegex(text) {
  if (!text) return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// ==========================================
// 1. GET ALL
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
// 2. GET MENU QUESTIONS
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
// 3. GET FILTERS
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
// 4. GET QUESTIONS BY FILTER
// ==========================================
const getQuestionsByFilter = async (req, res) => {
  try {
    const { grade, subject, type } = req.query;

    const rawCategory = req.query.category || req.query["category[]"];
    const rawDifficulty = req.query.difficulty || req.query["difficulty[]"];
    const rawTopics = req.query.topics || req.query["topics[]"];

    if (!grade || !subject) {
      return res.status(400).json({ error: "Grade and Subject are required" });
    }

    const subjectDoc = await Subject.findOne({
      className: grade,
      subjectName: subject,
    });

    if (!subjectDoc) {
      return res.status(404).json({ error: "Subject not found" });
    }

    let query = { subject: subjectDoc._id };

    if (type && type !== "ALL") {
      query.type = type;
    }

    const normalizeArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [val];
    };

    const catArray = normalizeArray(rawCategory);
    if (catArray.length > 0) {
      query.questionCategory = { $in: catArray };
    }

    const diffArray = normalizeArray(rawDifficulty);
    if (diffArray.length > 0) {
      query.difficulty = { $in: diffArray };
    }

    const topicArray = normalizeArray(rawTopics);
    if (topicArray.length > 0) {
      query.topics = { $in: topicArray };
    }

    const questions = await Question.find(query)
      .populate("topics", "name topicNumber")
      .populate("chapter", "name chapterNumber")
      .sort({ createdAt: -1 })
      .lean();

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
// 5. ADD QUESTION (SINGLE)
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
      questionData,
    } = req.body;

    if (!subjectId || subjectId === "undefined")
      return res.status(400).json({ error: "Subject ID missing." });

    // --- PARSING JSON FIELDS SAFELY ---
    let parsedStatement = statement
      ? JSON.parse(statement)
      : { en: "", ur: "" };
    let parsedTopics = topics ? JSON.parse(topics) : [];
    let parsedOptions = options ? JSON.parse(options) : [];
    let parsedTags = boardTags ? JSON.parse(boardTags) : [];
    let parsedQData = {};

    if (questionData) {
      try {
        parsedQData = JSON.parse(questionData);
      } catch (e) {
        parsedQData = {};
      }
    }

    // 🛑 1. DUPLICATE CHECK (With Regex Escape)
    if (parsedStatement.en && parsedStatement.en.trim().length > 0) {
      // ✅ FIXED: Escape special chars before creating RegExp
      const safeText = escapeRegex(parsedStatement.en.trim());

      const existingQuestion = await Question.findOne({
        "statement.en": {
          $regex: new RegExp(`^${safeText}$`, "i"),
        },
      });

      if (existingQuestion) {
        if (req.file && fs.existsSync(req.file.path))
          fs.unlinkSync(req.file.path);
        return res.status(400).json({
          error: "Duplicate Question! This statement already exists.",
        });
      }
    }

    // ✅ 2. SMART VECTOR GENERATION
    let vector = null;
    let textToEmbed = parsedStatement.en?.trim() || parsedStatement.ur?.trim();

    if (!textToEmbed && parsedQData) {
      if (parsedQData.itemA) textToEmbed = parsedQData.itemA;
      else if (parsedQData.poetName?.en) textToEmbed = parsedQData.poetName.en;
    }

    if (textToEmbed && textToEmbed.length > 0) {
      try {
        vector = await getEmbedding(textToEmbed);
      } catch (vecErr) {
        console.error("Vector Error:", vecErr);
      }
    }

    // ❌ 3. STRICT CHECK FOR VECTOR
    if (!vector || vector.length === 0) {
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      return res.status(500).json({
        error: "Vector generation failed! Question NOT saved. Try again.",
      });
    }

    // Image Upload
    let imageData = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "questions_images",
      });
      imageData = { url: result.secure_url, public_id: result.public_id };
      fs.unlinkSync(req.file.path);
    }

    // Create Object
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
      questionData: parsedQData,
      image: imageData,
      vector_embedding: vector,
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
      questionData,
    } = req.body;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: "Not found" });

    // Parse Data
    let parsedStatement = statement
      ? JSON.parse(statement)
      : question.statement;
    let parsedQData = questionData
      ? JSON.parse(questionData)
      : question.questionData;

    let updateData = {
      topics: topics ? JSON.parse(topics) : question.topics,
      type,
      difficulty,
      marks,
      questionCategory,
      important: important === "true",
      boardTags: boardTags ? JSON.parse(boardTags) : question.boardTags,
      statement: parsedStatement,
      options: options ? JSON.parse(options) : question.options,
      questionData: parsedQData,
    };

    // ✅ VECTOR UPDATE LOGIC
    const oldText = question.statement.en || question.statement.ur;
    const newText = parsedStatement.en || parsedStatement.ur;

    if (newText && newText !== oldText) {
      const newVector = await getEmbedding(newText);
      if (newVector && newVector.length > 0) {
        updateData.vector_embedding = newVector;
      }
    }

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
// ✅ ADD BULK QUESTIONS (Fully Fixed)
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

    const questionsToInsert = [];
    const failedQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // 1. Topic Mapping
      let assignedTopicIds = [];
      if (q.topics && Array.isArray(q.topics)) {
        q.topics.forEach((num) => {
          if (topicMap[num]) assignedTopicIds.push(topicMap[num]);
        });
      }
      if (assignedTopicIds.length === 0) {
        failedQuestions.push({
          index: i + 1,
          statement: q.statement?.en,
          reason: "No Valid Topics",
        });
        continue;
      }

      // 🛑 2. DUPLICATE CHECK (Fixed Regex)
      if (q.statement && q.statement.en) {
        // ✅ CRITICAL FIX: Escape special characters like $, ^, {
        const safeText = escapeRegex(q.statement.en.trim());

        const existingQuestion = await Question.findOne({
          "statement.en": {
            $regex: new RegExp(`^${safeText}$`, "i"),
          },
        });

        if (existingQuestion) {
          failedQuestions.push({
            index: i + 1,
            statement: q.statement.en,
            reason: "Duplicate: Question already exists in DB.",
          });
          continue;
        }
      }

      // ✅ 3. SMART VECTOR GENERATION
      let vector = null;
      let textToEmbed = q.statement?.en?.trim() || q.statement?.ur?.trim();

      if (!textToEmbed && q.questionData?.itemA) {
        textToEmbed = q.questionData.itemA;
      }

      if (textToEmbed) {
        try {
          vector = await getEmbedding(textToEmbed);
        } catch (vErr) {
          console.error(`Vector failed for item ${i + 1}:`, vErr);
        }
      }

      if (!vector || vector.length === 0) {
        failedQuestions.push({
          index: i + 1,
          statement: q.statement?.en,
          reason: "Vector Generation Failed",
        });
        continue;
      }

      // 4. Push to Insert List
      questionsToInsert.push({
        ...q,
        topics: assignedTopicIds,
        chapter: chapterId,
        subject: subjectId,
        classLevel: classLevel,
        difficulty: q.difficulty || "Medium",
        type: q.type || "MCQ",
        questionCategory: q.questionCategory || "TEXT",
        questionData: q.questionData || {},
        vector_embedding: vector,
      });
    }

    if (questionsToInsert.length > 0) {
      await Question.insertMany(questionsToInsert);
    }

    res.status(201).json({
      message: `Processed. Success: ${questionsToInsert.length}, Failed: ${failedQuestions.length}`,
      successCount: questionsToInsert.length,
      failedQuestions: failedQuestions,
    });
  } catch (err) {
    console.error("Bulk Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// DELETE UTILITIES
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
