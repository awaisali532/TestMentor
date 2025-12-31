const Question = require("../models/question");
const Topic = require("../models/topic");
const Subject = require("../models/subjectModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ✅ IMPORT VECTORIZER
const { getEmbedding } = require("../utils/vectorizer");

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
// 5. ADD QUESTION (SINGLE) - ✅ STRICT CHECK & DUPLICATE CHECK
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

    let parsedStatement = statement
      ? JSON.parse(statement)
      : { en: "", ur: "" };
    let parsedTopics = topics ? JSON.parse(topics) : [];
    let parsedOptions = options ? JSON.parse(options) : [];
    let parsedTags = boardTags ? JSON.parse(boardTags) : [];

    // 🛑 1. DUPLICATE CHECK (TEXT BASED)
    // Check if English statement exists (Case Insensitive)
    if (parsedStatement.en && parsedStatement.en.trim().length > 0) {
      const existingQuestion = await Question.findOne({
        "statement.en": {
          $regex: new RegExp(`^${parsedStatement.en.trim()}$`, "i"),
        },
      });

      if (existingQuestion) {
        // Agar duplicate mila to image delete karo (agar upload hui thi) aur error return karo
        if (req.file && fs.existsSync(req.file.path))
          fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({
            error: "Duplicate Question! This statement already exists.",
          });
      }
    }

    // ✅ 2. SMART VECTOR GENERATION (English First, Then Urdu)
    let vector = null;
    const textToEmbed =
      parsedStatement.en?.trim() || parsedStatement.ur?.trim();

    if (textToEmbed && textToEmbed.length > 0) {
      console.log("Generating vector...");
      try {
        vector = await getEmbedding(textToEmbed);
      } catch (vecErr) {
        console.error("Vector Error:", vecErr);
      }
    }

    // ❌ 3. STRICT CHECK: AGAR VECTOR FAIL HUA, TO SAVE MAT KARO
    if (!vector || vector.length === 0) {
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      return res.status(500).json({
        error: "Vector generation failed! Question NOT saved. Try again.",
      });
    }

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
      vector_embedding: vector, // ✅ Saved only if valid
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 6. UPDATE QUESTION - ✅ RE-GENERATE VECTOR
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

    let parsedStatement = statement
      ? JSON.parse(statement)
      : question.statement;

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
    };

    // ✅ VECTOR UPDATE LOGIC
    // Agar English text change hua, ya English nahi tha aur ab Urdu change hua
    const oldText = question.statement.en || question.statement.ur;
    const newText = parsedStatement.en || parsedStatement.ur;

    if (newText && newText !== oldText) {
      console.log("Statement changed, updating vector...");
      const newVector = await getEmbedding(newText);

      // Agar naya vector fail hua, to purana hi rehne do
      if (newVector && newVector.length > 0) {
        updateData.vector_embedding = newVector;
      } else {
        console.warn(
          "New vector generation failed during update. Keeping old vector."
        );
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
// ✅ ADD BULK QUESTIONS - STRICT CHECK & DUPLICATE CHECK
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
    const failedQuestions = []; // Error reporting ke liye

    // Loop through questions
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

      // 🛑 2. DUPLICATE CHECK (TEXT BASED)
      if (q.statement && q.statement.en) {
        const existingQuestion = await Question.findOne({
          "statement.en": {
            $regex: new RegExp(`^${q.statement.en.trim()}$`, "i"),
          },
        });

        if (existingQuestion) {
          failedQuestions.push({
            index: i + 1,
            statement: q.statement.en,
            reason: "Duplicate: Question already exists in DB.",
          });
          continue; // Skip this question
        }
      }

      // ✅ 3. SMART VECTOR GENERATION
      let vector = null;
      const textToEmbed = q.statement?.en?.trim() || q.statement?.ur?.trim();

      if (textToEmbed) {
        try {
          console.log(`Generating vector for item ${i + 1}...`);
          vector = await getEmbedding(textToEmbed);
        } catch (vErr) {
          console.error(`Vector failed for item ${i + 1}:`, vErr);
        }
      }

      // ❌ 4. STRICT CHECK: Agar vector nahi bana, to FAIL list me dalo
      if (!vector || vector.length === 0) {
        failedQuestions.push({
          index: i + 1,
          statement: q.statement?.en,
          reason: "Vector Generation Failed",
        });
        continue;
      }

      // Agar sab theek hai to add list mein dalo
      questionsToInsert.push({
        ...q,
        topics: assignedTopicIds,
        chapter: chapterId,
        subject: subjectId,
        classLevel: classLevel,
        difficulty: q.difficulty || "Medium",
        type: q.type || "MCQ",
        questionCategory: q.questionCategory || "TEXT",
        vector_embedding: vector, // ✅ Saved
      });
    }

    // Database Insert (Sirf Successful wale)
    if (questionsToInsert.length > 0) {
      await Question.insertMany(questionsToInsert);
    }

    // Response with Details
    res.status(201).json({
      message: `Processed. Success: ${questionsToInsert.length}, Failed: ${failedQuestions.length}`,
      successCount: questionsToInsert.length,
      failedQuestions: failedQuestions, // Frontend ko batao kya add nahi hua
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
