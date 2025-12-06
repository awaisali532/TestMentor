const Chapter = require("../models/Chapter");
const Subject = require("../models/subjectModel"); // Subject check karne ke liye
const Topic = require("../models/topic");
const Question = require("../models/question");
// 1. Add Chapter (Updated with Auto-Topic)
const addChapter = async (req, res) => {
  try {
    const { subjectId, chapterNumber, name, description } = req.body;

    if (!subjectId || !chapterNumber || !name) {
      return res
        .status(400)
        .json({ error: "Subject, Chapter No, and Name are required" });
    }

    const exists = await Chapter.findOne({ subject: subjectId, chapterNumber });
    if (exists) {
      return res
        .status(400)
        .json({ error: `Chapter ${chapterNumber} already exists!` });
    }

    // 1. Create Chapter
    const newChapter = new Chapter({
      subject: subjectId,
      chapterNumber,
      name,
      description,
    });
    await newChapter.save();

    // 2. AUTOMATICALLY Create "General" Topic
    const defaultTopic = new Topic({
      chapter: newChapter._id,
      topicNumber: "0.0", // Keeps it at the top
      name: "General / Exercise Questions",
      description: "Questions covering the entire chapter or book exercises.",
    });
    await defaultTopic.save();

    res.status(201).json(newChapter);
  } catch (err) {
    console.error("Add Chapter Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// 2. Get Chapters by Subject ID
const getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Chapters ko number wise sort karo (1, 2, 3...)
    const chapters = await Chapter.find({ subject: subjectId }).sort({
      chapterNumber: 1,
    });

    res.json(chapters);
  } catch (err) {
    console.error("Get Chapter Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// 3. Update Chapter (Edit Name, Number, Description)
const updateChapter = async (req, res) => {
  try {
    const { id } = req.params; // Chapter ki ID URL se ayegi
    const { chapterNumber, name, description } = req.body;

    // Validation
    if (!chapterNumber || !name) {
      return res
        .status(400)
        .json({ error: "Chapter Number and Name are required" });
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      id,
      { chapterNumber, name, description },
      { new: true, runValidators: true } // new: true se updated data wapis milega
    );

    if (!updatedChapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    res.json(updatedChapter);
  } catch (err) {
    // Duplicate Error Handle (Agar user wahi number rakh de jo pehle se kisi aur chapter ka hai)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "This chapter number already exists in this subject!" });
    }
    console.error("Update Chapter Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// 4. DELETE CHAPTER (WITH CASCADE DELETE)
const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    // 1. Is Chapter ke saare Topics dhundo
    const topics = await Topic.find({ chapter: id });

    // Un Topics ki IDs nikalo array mein
    const topicIds = topics.map((t) => t._id);

    // 2. 🔥 CLEANUP: Un sab Topics ke Questions ura do
    await Question.deleteMany({ topic: { $in: topicIds } });

    // 3. 🔥 CLEANUP: Ab wo Topics ura do
    await Topic.deleteMany({ chapter: id });

    // 4. Finally Chapter ura do
    await Chapter.findByIdAndDelete(id);

    res.json({
      message: "Chapter, Topics, and Questions deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  addChapter,
  getChaptersBySubject,
  updateChapter,
  deleteChapter,
};
