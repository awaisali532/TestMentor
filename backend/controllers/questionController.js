const Question = require("../models/question");
const Topic = require("../models/topic");
const Subject = require("../models/subjectModel");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

// Helper: Regex Escape
function escapeRegex(text) {
  if (!text) return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Helper: Safe JSON Parse
const safeParse = (data, fallback) => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

// Helper: Upload Buffer to Cloudinary
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

// Helper: Case Insensitive Formatting
const toTitleCase = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ==========================================
// 4. GET QUESTIONS BY FILTER
// ==========================================
const getQuestionsByFilter = async (req, res) => {
  try {
    const { grade, subject, type, category, difficulty, topics, chapters } =
      req.body;

    if (!grade || !subject)
      return res.status(400).json({ error: "Grade/Subject missing" });

    let subjectDoc;
    if (mongoose.Types.ObjectId.isValid(subject)) {
      subjectDoc = await Subject.findById(subject);
    } else {
      subjectDoc = await Subject.findOne({
        className: grade,
        subjectName: subject,
      });
    }

    if (!subjectDoc) {
      return res.status(404).json({ error: "Subject not found" });
    }

    let query = { subject: subjectDoc._id };

    if (type && type !== "ALL") query.type = type;

    const normalizeArray = (val) =>
      !val ? [] : Array.isArray(val) ? val : [val];

    const catArray = normalizeArray(category);
    if (catArray.length > 0 && !catArray.includes("ANY")) {
      query.questionCategory = { $in: catArray };
    }

    const diffArray = normalizeArray(difficulty);
    if (diffArray.length > 0) {
      query.difficulty = { $in: diffArray.map((d) => toTitleCase(d)) };
    }

    const topicArray = normalizeArray(topics);
    const chapterArray = normalizeArray(chapters);

    if (chapterArray.length > 0) {
      const chapterObjectIds = chapterArray.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
      query.chapter = { $in: chapterObjectIds };
    } else if (topicArray.length > 0) {
      const topicObjectIds = topicArray.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
      query.topics = { $in: topicObjectIds };
    }

    const questions = await Question.find(query)
      .populate("topics", "name topicNumber")
      .populate("chapter", "name chapterNumber")
      .lean();

    // Fallback Check: If no results with Chapter, try using IDs as Topics
    if (questions.length === 0 && chapterArray.length > 0) {
      delete query.chapter;
      query.topics = {
        $in: chapterArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
      const fallbackQuestions = await Question.find(query).lean();
      if (fallbackQuestions.length > 0) {
        return res.status(200).json(fallbackQuestions);
      }
    }

    res.status(200).json(questions);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message });
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

    let parsedStatement = safeParse(statement, { en: "", ur: "" });
    let parsedTopics = safeParse(topics, []);
    let parsedOptions = safeParse(options, []);
    let parsedTags = safeParse(boardTags, []);
    let parsedQData = safeParse(questionData, {});

    let parsedCategory = [];
    if (questionCategory) {
      if (Array.isArray(questionCategory)) {
        parsedCategory = questionCategory;
      } else if (typeof questionCategory === "string") {
        try {
          const parsed = JSON.parse(questionCategory);
          parsedCategory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          parsedCategory = questionCategory.includes(",")
            ? questionCategory.split(",").map((c) => c.trim())
            : [questionCategory.trim()];
        }
      }
    } else {
      parsedCategory = ["TEXT"];
    }

    // Duplicate Check
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

    let imageData = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageData = { url: result.secure_url, public_id: result.public_id };
      } catch (uploadError) {
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const newQuestion = new Question({
      topics: parsedTopics,
      chapter: chapterId,
      subject: subjectId,
      classLevel,
      type,
      questionCategory: parsedCategory,
      difficulty,
      marks,
      important: important === "true",
      boardTags: parsedTags,
      statement: parsedStatement,
      options: parsedOptions,
      questionData: parsedQData,
      image: imageData,
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    console.error("Add Question Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 6. UPDATE QUESTION
// ==========================================
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: "Not found" });

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
      removeImage,
    } = req.body;

    let parsedCategory = question.questionCategory;

    if (questionCategory) {
      if (Array.isArray(questionCategory)) {
        parsedCategory = questionCategory;
      } else if (typeof questionCategory === "string") {
        try {
          const parsed = JSON.parse(questionCategory);
          parsedCategory = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          parsedCategory = questionCategory.includes(",")
            ? questionCategory.split(",").map((c) => c.trim())
            : [questionCategory.trim()];
        }
      }
    }

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
      type: type || question.type,
      difficulty: difficulty || question.difficulty,
      marks: marks || question.marks,
      questionCategory: parsedCategory,
      important: important === "true" || important === true,
      boardTags: parsedTags,
      statement: parsedStatement,
      options: parsedOptions,
      questionData: parsedQData,
    };

    if (req.file) {
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
      if (question.image && question.image.public_id) {
        try {
          await cloudinary.uploader.destroy(question.image.public_id);
        } catch (cloudErr) {
          console.error("Cloudinary Remove Error:", cloudErr);
        }
      }
      updateData.image = null;
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

const getQuestionsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    let questions = await Question.find({ chapter: chapterId })
      .populate("topics", "name topicNumber")
      .lean();

    questions.sort((a, b) => {
      const topicA = a.topics?.[0]?.topicNumber || "0";
      const topicB = b.topics?.[0]?.topicNumber || "0";
      const topicCompare = topicA.localeCompare(topicB, undefined, {
        numeric: true,
      });
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
