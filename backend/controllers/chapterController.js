const Chapter = require("../models/chapter");
const Subject = require("../models/subjectModel");
const Topic = require("../models/Topic");
const Question = require("../models/Question");

// 1. ADD SINGLE CHAPTER (Fixed Topic Creation)
const addChapter = async (req, res) => {
  try {
    const { subjectId, chapterNumber, name } = req.body;

    // Validation
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

    // 1. Create Chapter (Ye Successfully Save ho rha tha)
    const newChapter = new Chapter({
      subject: subjectId,
      chapterNumber,
      name: {
        en: name.en,
        ur: name.ur || "",
      },
    });
    await newChapter.save();

    // 2. AUTOMATICALLY Create "General" Topic
    // 🛑 FIX: Yahan 'name' string nahi, object hona chahiye jesa Chapter me hai
    const defaultTopic = new Topic({
      chapter: newChapter._id,
      topicNumber: "0.0",
      name: {
        en: "General / Exercise Questions",
        ur: "General / Mashqi Sawalaat", // Optional Urdu translation
      },
    });
    await defaultTopic.save(); // Ab ye fail nahi hoga

    res.status(201).json(newChapter);
  } catch (err) {
    console.error("Add Chapter Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. GET CHAPTERS (No Change)
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

// 3. UPDATE CHAPTER (No Change)
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

// 4. DELETE CHAPTER (No Change)
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

// 5. BULK UPLOAD (Fixed Topic Creation here too)
const addBulkChapters = async (req, res) => {
  try {
    const { chapters } = req.body;

    if (!chapters || chapters.length === 0) {
      return res.status(400).json({ error: "No chapters provided" });
    }

    // 1. Insert Chapters
    const result = await Chapter.insertMany(chapters, { ordered: false });

    // 2. Create Topics
    if (result.length > 0) {
      const topicsPayload = result.map((ch) => ({
        chapter: ch._id,
        topicNumber: "0.0",
        // 🛑 FIX: Name Object format mein
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
    // 🛑 Handle Write Errors
    if (error.writeErrors) {
      const isDuplicate = error.writeErrors.some((e) => e.code === 11000);

      if (isDuplicate) {
        const insertedDocs = error.insertedDocs || [];

        // Jo success huye unke topics banao
        if (insertedDocs.length > 0) {
          const topicsPayload = insertedDocs.map((ch) => ({
            chapter: ch._id,
            topicNumber: "0.0",
            // 🛑 FIX: Name Object format mein yahan bhi
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
        console.error("Validation Error:", error.writeErrors[0].err);
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
};
