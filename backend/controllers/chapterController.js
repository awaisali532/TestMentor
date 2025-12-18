const Chapter = require("../models/chapter");
const Subject = require("../models/subjectModel");
const Topic = require("../models/topic");
const Question = require("../models/question");

// ✅ NEW FUNCTION: Get Chapters WITH Topics (For Paper Wizard)
const getChaptersByFilter = async (req, res) => {
  try {
    const { className, subjectName } = req.query;

    // 1. Find Subject ID first (Kyunke frontend se hum Name bhej rahe hain)
    const subject = await Subject.findOne({ className, subjectName });

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // 2. Aggregate: Chapters + Topics
    const chapters = await Chapter.aggregate([
      // Step A: Match Chapters for this Subject
      { $match: { subject: subject._id } },

      // Step B: Sort Chapters (1, 2, 3...)
      { $sort: { chapterNumber: 1 } },

      // Step C: Join with Topics Collection
      {
        $lookup: {
          from: "topics", // DB collection name (plural)
          localField: "_id", // Chapter ID
          foreignField: "chapter", // Topic model mein field name
          as: "topics", // Output array name
        },
      },
    ]);

    // 3. Javascript Sort for Topics (1.1, 1.2, 1.10 logic)
    // MongoDB aggregation mein string numbers ko sort karna mushkil hota hai, isliye yahan kar rahe hain.
    chapters.forEach((chap) => {
      if (chap.topics && chap.topics.length > 0) {
        chap.topics.sort((a, b) =>
          a.topicNumber.localeCompare(b.topicNumber, undefined, {
            numeric: true,
          })
        );
      }
    });

    res.json(chapters);
  } catch (err) {
    console.error("Syllabus Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch syllabus" });
  }
};

// 1. ADD SINGLE CHAPTER (Old logic preserved)
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

    // Auto Create General Topic
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

// 2. GET CHAPTERS (Simple List)
const getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const chapters = await Chapter.find({ subject: subjectId }).sort({
      chapterNumber: 1,
    });
    res.json(chapters);
  } catch (err) {
    console.error("Get Chapter Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. UPDATE CHAPTER
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
      { new: true, runValidators: true }
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

// 4. DELETE CHAPTER
const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    const topics = await Topic.find({ chapter: id });
    const topicIds = topics.map((t) => t._id);

    await Question.deleteMany({ topic: { $in: topicIds } });
    await Topic.deleteMany({ chapter: id });
    await Chapter.findByIdAndDelete(id);

    res.json({ message: "Chapter and all its data deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. BULK UPLOAD
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
  getChaptersBySubject,
  updateChapter,
  deleteChapter,
  getChaptersByFilter, // ✅ EXPORTED NEW FUNCTION
};
