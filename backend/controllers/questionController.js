const Question = require("../models/question");
const Topic = require("../models/topic");
const Subject = require("../models/subjectModel");
const cloudinary = require("../config/cloudinary");

// ✅ IMPORT VECTORIZER
const { getEmbedding } = require("../utils/vectorizer");

// ✅ HELPER: Regex Escape
function escapeRegex(text) {
  if (!text) return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// ✅ HELPER: Safe JSON Parse
const safeParse = (data, fallback) => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

// ✅ HELPER: Upload Buffer to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "questions_images" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    uploadStream.end(fileBuffer);
  });
};

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
    res.status(200).json({ success: true, categories, difficulties });
  } catch (error) {
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

    if (!grade || !subject)
      return res.status(400).json({ error: "Grade and Subject are required" });

    const subjectDoc = await Subject.findOne({
      className: grade,
      subjectName: subject,
    });
    if (!subjectDoc)
      return res.status(404).json({ error: "Subject not found" });

    let query = { subject: subjectDoc._id };
    if (type && type !== "ALL") query.type = type;

    const normalizeArray = (val) =>
      !val ? [] : Array.isArray(val) ? val : [val];

    const catArray = normalizeArray(rawCategory);
    if (catArray.length > 0) query.questionCategory = { $in: catArray };

    const diffArray = normalizeArray(rawDifficulty);
    if (diffArray.length > 0) query.difficulty = { $in: diffArray };

    const topicArray = normalizeArray(rawTopics);
    if (topicArray.length > 0) query.topics = { $in: topicArray };

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
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

// ==========================================
// 5. ADD QUESTION (SINGLE) - ✅ UPDATED
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
      questionCategory, // Can be String or Array from frontend
      questionData,
    } = req.body;

    if (!subjectId || subjectId === "undefined")
      return res.status(400).json({ error: "Subject ID missing." });

    // ✅ SAFE PARSING
    let parsedStatement = safeParse(statement, { en: "", ur: "" });
    let parsedTopics = safeParse(topics, []);
    let parsedOptions = safeParse(options, []);
    let parsedTags = safeParse(boardTags, []);
    let parsedQData = safeParse(questionData, {});

    // ✅ CATEGORY FIX: Ensure it is always an Array
    let parsedCategory = [];
    if (questionCategory) {
      if (Array.isArray(questionCategory)) {
        parsedCategory = questionCategory;
      } else if (typeof questionCategory === "string") {
        try {
          // Sometimes frontend sends JSON string like '["TEXT"]'
          const parsed = JSON.parse(questionCategory);
          parsedCategory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If not JSON, treat as comma-separated or single string
          parsedCategory = questionCategory.includes(",")
            ? questionCategory.split(",").map((c) => c.trim())
            : [questionCategory.trim()];
        }
      }
    } else {
      parsedCategory = ["TEXT"]; // Default
    }

    // ✅ DUPLICATE CHECK
    if (parsedStatement.en && parsedStatement.en.trim().length > 0) {
      const safeText = escapeRegex(parsedStatement.en.trim());
      const existingQuestion = await Question.findOne({
        "statement.en": { $regex: new RegExp(`^${safeText}$`, "i") },
      });

      if (existingQuestion) {
        return res.status(400).json({
          error: "Duplicate Question! This statement already exists.",
        });
      }
    }

    // ✅ VECTOR GENERATION (Updated Logic)
    let vector = null;
    let textToEmbed = parsedStatement.en?.trim() || parsedStatement.ur?.trim();

    if (!textToEmbed && parsedQData) {
      if (parsedQData.itemA)
        textToEmbed = parsedQData.itemA; // Pairs/Idioms
      else if (parsedQData.poetName?.en) textToEmbed = parsedQData.poetName.en; // Poetry
    }

    if (textToEmbed && textToEmbed.length > 0) {
      try {
        vector = await getEmbedding(textToEmbed);
      } catch (vecErr) {
        console.error("Vector Error:", vecErr);
      }
    }

    // Fallback Vector (Taake save fail na ho agar API down ho)
    if (!vector || vector.length === 0) {
      console.warn("Vector generation skipped (API issue or Empty text).");
      vector = []; // Save empty vector instead of blocking
    }

    // ✅ IMAGE UPLOAD (BUFFER)
    let imageData = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageData = { url: result.secure_url, public_id: result.public_id };
      } catch (uploadError) {
        console.error("Image Upload Failed:", uploadError);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const newQuestion = new Question({
      topics: parsedTopics,
      chapter: chapterId,
      subject: subjectId,
      classLevel,
      type,
      questionCategory: parsedCategory, // ✅ Saved as Array
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
    console.error("Add Question Error:", err);
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
// 8. ADD BULK QUESTIONS
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

      if (q.statement && q.statement.en) {
        const safeText = escapeRegex(q.statement.en.trim());
        const existingQuestion = await Question.findOne({
          "statement.en": { $regex: new RegExp(`^${safeText}$`, "i") },
        });
        if (existingQuestion) {
          failedQuestions.push({
            index: i + 1,
            statement: q.statement.en,
            reason: "Duplicate",
          });
          continue;
        }
      }

      let vector = null;
      let textToEmbed = q.statement?.en?.trim() || q.statement?.ur?.trim();
      if (!textToEmbed && q.questionData?.itemA)
        textToEmbed = q.questionData.itemA;

      if (textToEmbed) {
        try {
          vector = await getEmbedding(textToEmbed);
        } catch (vErr) {
          console.error(vErr);
        }
      }

      if (!vector || vector.length === 0) {
        failedQuestions.push({
          index: i + 1,
          statement: q.statement?.en,
          reason: "Vector Gen Failed",
        });
        continue;
      }

      questionsToInsert.push({
        ...q,
        topics: assignedTopicIds,
        chapter: chapterId,
        subject: subjectId,
        classLevel,
        difficulty: q.difficulty || "Medium",
        type: q.type || "MCQ",
        questionCategory: q.questionCategory || "TEXT",
        questionData: q.questionData || {},
        vector_embedding: vector,
      });
    }

    if (questionsToInsert.length > 0)
      await Question.insertMany(questionsToInsert);

    res.status(201).json({
      message: `Processed. Success: ${questionsToInsert.length}, Failed: ${failedQuestions.length}`,
      successCount: questionsToInsert.length,
      failedQuestions: failedQuestions,
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
    res.json({ message: "Deleted successfully" });
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
// ✅ NEW: Get All Questions by Chapter (Sorted by Topic Number)
const getQuestionsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // 1. Fetch Questions & Populate Topics
    let questions = await Question.find({ chapter: chapterId })
      .populate("topics", "name topicNumber") // ✅ Populate Zaroori hai
      .lean(); // ✅ Convert to Plain JSON for sorting

    // 2. Manual Sort in JavaScript (Kyunke MongoDB populated field pr sort nahi krta)
    questions.sort((a, b) => {
      // Topic Number extract karo (Safe check ke sath)
      const topicA = a.topics?.[0]?.topicNumber || "0";
      const topicB = b.topics?.[0]?.topicNumber || "0";

      // Numeric Compare (e.g. 1.2 vs 1.10 ko sahi treat karega)
      const topicCompare = topicA.localeCompare(topicB, undefined, {
        numeric: true,
      });

      // Agar Topic same hai, to Newest First rakho
      if (topicCompare === 0) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      return topicCompare;
    });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ==========================================
// 6. UPDATE QUESTION (✅ UPDATED)
// ==========================================
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: "Not found" });

    // Destructure body
    const {
      topics,
      type,
      difficulty,
      marks,
      important,
      boardTags,
      statement,
      options,
      questionCategory, // Can come as String, Array, or undefined
      questionData,
      removeImage,
    } = req.body;

    // ✅ 1. CATEGORY PARSING (Fix for Array vs String)
    let parsedCategory = question.questionCategory; // Default: Keep existing

    if (questionCategory) {
      if (Array.isArray(questionCategory)) {
        parsedCategory = questionCategory;
      } else if (typeof questionCategory === "string") {
        try {
          // Try parsing JSON string (e.g., '["TEXT", "CONCEPTUAL"]')
          const parsed = JSON.parse(questionCategory);
          parsedCategory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // Fallback: Comma separated or single string
          parsedCategory = questionCategory.includes(",")
            ? questionCategory.split(",").map((c) => c.trim())
            : [questionCategory.trim()];
        }
      }
    }

    // ✅ 2. SAFE PARSING OTHER FIELDS
    // Logic: Agar req.body mein naya data hai to parse karo, warna purana rehne do
    let parsedStatement = statement
      ? safeParse(statement, question.statement)
      : question.statement;
    let parsedQData = questionData
      ? safeParse(questionData, question.questionData)
      : question.questionData;
    let parsedTopics = topics
      ? safeParse(topics, question.topics)
      : question.topics;
    let parsedTags = boardTags
      ? safeParse(boardTags, question.boardTags)
      : question.boardTags;
    let parsedOptions = options
      ? safeParse(options, question.options)
      : question.options;

    let updateData = {
      topics: parsedTopics,
      type: type || question.type, // Keep old if not provided
      difficulty: difficulty || question.difficulty,
      marks: marks || question.marks,
      questionCategory: parsedCategory, // ✅ Updated Array Logic
      important: important === "true" || important === true, // Handle boolean/string
      boardTags: parsedTags,
      statement: parsedStatement,
      options: parsedOptions,
      questionData: parsedQData,
    };

    // ✅ 3. VECTOR UPDATE (Smart Logic)
    // Sirf tab update karo agar Text change hua ho
    const oldText = question.statement?.en || question.statement?.ur || "";
    const newText = parsedStatement?.en || parsedStatement?.ur || "";

    // Fallback: Agar text empty hai to questionData check karo (Pairs/Poetry k liye)
    let textToEmbed = newText;
    if (!textToEmbed && parsedQData) {
      if (parsedQData.itemA) textToEmbed = parsedQData.itemA;
      else if (parsedQData.poetName?.en) textToEmbed = parsedQData.poetName.en;
    }

    const oldEmbedText =
      oldText ||
      question.questionData?.itemA ||
      question.questionData?.poetName?.en ||
      "";

    if (textToEmbed && textToEmbed !== oldEmbedText) {
      try {
        const newVector = await getEmbedding(textToEmbed);
        if (newVector && newVector.length > 0) {
          updateData.vector_embedding = newVector;
        }
      } catch (vectorError) {
        console.error("Vector Update Failed (Ignored):", vectorError.message);
      }
    }

    // ✅ 4. IMAGE UPDATE LOGIC
    if (req.file) {
      // Case A: New Image Uploaded -> Replace Old
      if (question.image && question.image.public_id) {
        try {
          await cloudinary.uploader.destroy(question.image.public_id);
        } catch (cloudErr) {
          console.error("Cloudinary Delete Error:", cloudErr);
        }
      }

      try {
        const result = await uploadToCloudinary(req.file.buffer);
        updateData.image = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      } catch (uploadError) {
        return res
          .status(500)
          .json({ error: "Image upload failed during update" });
      }
    } else if (removeImage === "true") {
      // ✅ Case B: User clicked "X" -> Remove Image
      if (question.image && question.image.public_id) {
        try {
          await cloudinary.uploader.destroy(question.image.public_id);
        } catch (cloudErr) {
          console.error("Cloudinary Remove Error:", cloudErr);
        }
      }
      updateData.image = null; // Set to null in DB
    }

    const updatedQ = await Question.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json(updatedQ);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Update failed: " + err.message });
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
  getQuestionsByChapter,
};
