const mongoose = require("mongoose"); // ✅ Mongoose Import Zaroori hai Aggregation k liye
const Chapter = require("../models/chapter");
const Subject = require("../models/subjectModel");
const Topic = require("../models/topic");
const Question = require("../models/question");
const cloudinary = require("../config/cloudinary");

// ==========================================
// 1. GET SYLLABUS (Chapters + Topics) - For Paper Wizard
// ==========================================
const getChaptersByFilter = async (req, res) => {
  try {
    const { className, subjectName } = req.query;

    const subject = await Subject.findOne({ className, subjectName });

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const chapters = await Chapter.aggregate([
      { $match: { subject: subject._id } },
      { $sort: { chapterNumber: 1 } },
      {
        $lookup: {
          from: "topics",
          localField: "_id",
          foreignField: "chapter",
          as: "topics",
        },
      },
    ]);

    chapters.forEach((chap) => {
      if (chap.topics && chap.topics.length > 0) {
        chap.topics.sort((a, b) =>
          a.topicNumber.localeCompare(b.topicNumber, undefined, {
            numeric: true,
          }),
        );
      }
    });

    res.json(chapters);
  } catch (err) {
    console.error("Syllabus Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch syllabus" });
  }
};

// ==========================================
// 2. ADD CHAPTER (Single)
// ==========================================
const addChapter = async (req, res) => {
  try {
    const { subjectId, chapterNumber, name } = req.body;

    if (!subjectId || !chapterNumber || !name || !name.en) {
      return res
        .status(400)
        .json({ error: "Subject, Chapter No, and English Name are required" });
    }

    const exists = await Chapter.findOne({ subject: subjectId, chapterNumber });
    if (exists) {
      return res
        .status(400)
        .json({ error: `Chapter ${chapterNumber} already exists!` });
    }

    const newChapter = new Chapter({
      subject: subjectId,
      chapterNumber,
      name: {
        en: name.en,
        ur: name.ur || "",
      },
    });
    await newChapter.save();

    const defaultTopic = new Topic({
      chapter: newChapter._id,
      topicNumber: "0.0",
      name: {
        en: "General / Exercise Questions",
        ur: "General / Mashqi Sawalaat",
      },
    });
    await defaultTopic.save();

    res.status(201).json(newChapter);
  } catch (err) {
    console.error("Add Chapter Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =================================================
// ✅ GET CHAPTERS BY SUBJECT (UPDATED WITH AGGREGATION)
// =================================================
const getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    let finalSubjectId = subjectId;

    // 1. Check ID Validity (Handle Subject Name case)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(subjectId);

    if (!isValidObjectId) {
      const subjectDoc = await Subject.findOne({
        $or: [{ subjectName: subjectId }, { name: subjectId }],
      });

      if (!subjectDoc) {
        return res.status(200).json([]);
      }
      finalSubjectId = subjectDoc._id;
    }

    // 2. ✅ USE AGGREGATION Instead of Populate
    // This fetches topics directly from the DB collection, ignoring Schema strictness.
    const chapters = await Chapter.aggregate([
      {
        $match: {
          subject: new mongoose.Types.ObjectId(finalSubjectId),
        },
      },
      {
        $lookup: {
          from: "topics", // DB Collection Name (lowercase)
          localField: "_id", // Chapter ID
          foreignField: "chapter", // Topic Model field
          as: "topics", // Output Array Name
        },
      },
      {
        $sort: { chapterNumber: 1 },
      },
    ]);

    res.status(200).json(chapters);
  } catch (error) {
    console.error("Get Chapter Error:", error);
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
};

// ==========================================
// 4. UPDATE CHAPTER
// ==========================================
const updateChapter = async (req, res) => {
  try {
    const { chapterNumber, name } = req.body;

    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      {
        chapterNumber,
        name: {
          en: name.en,
          ur: name.ur,
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedChapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    res.json(updatedChapter);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Chapter Number already exists in this Subject!" });
    }
    res.status(500).json({ error: "Update failed" });
  }
};

// ==========================================
// 5. DELETE CHAPTER (Cascade Delete)
// ==========================================
const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    const questions = await Question.find({ chapter: id });

    const imageDeletePromises = questions
      .filter((q) => q.image && q.image.public_id)
      .map((q) => cloudinary.uploader.destroy(q.image.public_id));

    await Promise.all(imageDeletePromises);

    await Question.deleteMany({ chapter: id });
    await Topic.deleteMany({ chapter: id });
    await Chapter.findByIdAndDelete(id);

    console.log(`[Cascade Delete] Chapter ${id} and all related data removed.`);

    res.json({
      message: "Chapter and all associated data deleted successfully",
    });
  } catch (err) {
    console.error("Delete Chapter Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 6. BULK UPLOAD
// ==========================================
const addBulkChapters = async (req, res) => {
  try {
    const { chapters } = req.body;

    if (!chapters || chapters.length === 0) {
      return res.status(400).json({ error: "No chapters provided" });
    }

    const result = await Chapter.insertMany(chapters, { ordered: false });

    if (result.length > 0) {
      const topicsPayload = result.map((ch) => ({
        chapter: ch._id,
        topicNumber: "0.0",
        name: {
          en: "General / Exercise Questions",
          ur: "General / Mashqi Sawalaat",
        },
      }));
      await Topic.insertMany(topicsPayload);
    }

    res.status(201).json({
      message: "Bulk upload successful",
      count: result.length,
      data: result,
    });
  } catch (error) {
    if (error.writeErrors) {
      const isDuplicate = error.writeErrors.some((e) => e.code === 11000);

      if (isDuplicate) {
        const insertedDocs = error.insertedDocs || [];
        if (insertedDocs.length > 0) {
          const topicsPayload = insertedDocs.map((ch) => ({
            chapter: ch._id,
            topicNumber: "0.0",
            name: {
              en: "General / Exercise Questions",
              ur: "General / Mashqi Sawalaat",
            },
          }));
          await Topic.insertMany(topicsPayload);
        }
        return res.status(201).json({
          message: `Partial Success: ${insertedDocs.length} added. Others were duplicates.`,
          count: insertedDocs.length,
        });
      } else {
        return res.status(400).json({
          error: `Validation Failed: ${
            error.writeErrors[0].err.errmsg || "Check Data Fields"
          }`,
        });
      }
    }
    console.error("Bulk Error:", error);
    res.status(500).json({ error: "Bulk upload failed" });
  }
};

module.exports = {
  addChapter,
  addBulkChapters,
  getChaptersBySubject, // ✅ Updated Function
  updateChapter,
  deleteChapter,
  getChaptersByFilter,
};
