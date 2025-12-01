const Chapter = require("../models/chapter");

// Add Chapter
const addChapter = async (req, res) => {
  try {
    const { subjectId, chapterNumber, name, description } = req.body;

    // Check duplication
    const exists = await Chapter.findOne({ subject: subjectId, chapterNumber });
    if (exists)
      return res
        .status(400)
        .json({ error: "Chapter number already exists in this subject" });

    const newChapter = new Chapter({
      subject: subjectId,
      chapterNumber,
      name,
      description,
    });
    await newChapter.save();
    res.status(201).json(newChapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Chapters by Subject (Cascading Dropdown ke liye zaroori hai)
const getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const chapters = await Chapter.find({ subject: subjectId }).sort({
      chapterNumber: 1,
    });
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addChapter, getChaptersBySubject };
