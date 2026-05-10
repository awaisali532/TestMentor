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
// ==========================================
// 2. ADD CHAPTER (Single) - UPDATED
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

    // ✅ CHANGED HERE: Used dynamic chapterNumber instead of fixed "0.0"
    const defaultTopic = new Topic({
      chapter: newChapter._id,
      topicNumber: `${chapterNumber}.0`, // e.g., if Chapter is 5, this becomes "5.0"
      name: {
        en: "General / Exercise Questions",
        ur: "جنرل / مشقی سوالات",
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
// 6. BULK UPLOAD (ROBUST & FIXED)
// ==========================================
const addBulkChapters = async (req, res) => {
  try {
    const { chapters } = req.body;

    if (!chapters || chapters.length === 0) {
      return res.status(400).json({ error: "No chapters provided" });
    }

    // 1. Attempt to insert chapters
    // ordered: false means "Keep going even if one fails"
    const result = await Chapter.insertMany(chapters, { ordered: false });

    // --- SCENARIO 1: ALL SUCCESSFUL (No Duplicates) ---
    if (result.length > 0) {
      const topicsPayload = result.map((ch) => ({
        chapter: ch._id,
        topicNumber: `${ch.chapterNumber}.0`,
        name: {
          en: "General / Exercise Questions",
          ur: "جنرل / مشقی سوالات",
        },
      }));
      await Topic.insertMany(topicsPayload);
    }

    return res.status(201).json({
      message: "All chapters uploaded successfully!",
      addedCount: result.length,
      status: "success",
    });
  } catch (error) {
    // --- SCENARIO 2 & 3: PARTIAL SUCCESS or DUPLICATES ---

    // Check if this is a BulkWriteError (Standard Mongoose error for bulk inserts)
    if (error.writeErrors || error.code === 11000) {
      // Get the documents that WERE successfully inserted
      const insertedDocs = error.insertedDocs || [];
      const duplicateCount = error.writeErrors ? error.writeErrors.length : 0;

      // If some documents were actually saved, we must add their Topics
      if (insertedDocs.length > 0) {
        try {
          const topicsPayload = insertedDocs.map((ch) => ({
            chapter: ch._id,
            topicNumber: `${ch.chapterNumber}.0`,
            name: {
              en: "General / Exercise Questions",
              ur: "جنرل / مشقی سوالات",
            },
          }));
          await Topic.insertMany(topicsPayload);
        } catch (topicError) {
          console.error(
            "Error adding topics for partial chapters:",
            topicError,
          );
          // We don't stop the response here, because chapters are already saved
        }

        return res.status(201).json({
          message: `Partial Success: ${insertedDocs.length} added. ${duplicateCount} were duplicates/skipped.`,
          addedCount: insertedDocs.length,
          skippedCount: duplicateCount,
          status: "warning", // Frontend can show a Yellow/Orange toast
        });
      } else {
        // If insertedDocs is empty, it means ALL failed (likely all duplicates)
        return res.status(400).json({
          error: "All provided chapters already exist (Duplicate Data).",
          status: "error",
        });
      }
    }

    // --- SCENARIO 4: REAL SERVER ERROR ---
    console.error("Critical Bulk Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error during upload." });
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
