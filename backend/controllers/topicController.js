const Topic = require("../models/topic");
const Question = require("../models/Question");

// 1. CREATE: Add Single Topic
const addTopic = async (req, res) => {
  try {
    const { chapterId, topicNumber, name } = req.body;

    // Strict Validation
    if (!chapterId || !topicNumber || !name || !name.en) {
      return res.status(400).json({
        error: "Chapter, Topic Number, and English Name are required",
      });
    }

    const newTopic = new Topic({
      chapter: chapterId,
      topicNumber,
      name: {
        en: name.en,
        ur: name.ur || "",
      },
    });

    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Topic Number already exists in this chapter!" });
    }
    res.status(500).json({ error: err.message });
  }
};

// 2. READ: Get Topics (✅ FIXED SORTING)
const getTopicsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // ✅ FIX: Added .collation() with numericOrdering: true
    // This tells MongoDB to treat the string numbers as actual numbers during sort.
    // Result: 1.1, 1.2, ... 1.9, 1.10 (Correct Order)
    const topics = await Topic.find({ chapter: chapterId })
      .collation({ locale: "en", numericOrdering: true })
      .sort({ topicNumber: 1 });

    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. UPDATE: Edit Topic
const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { topicNumber, name } = req.body;

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      {
        topicNumber,
        name: {
          en: name.en,
          ur: name.ur,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedTopic)
      return res.status(404).json({ error: "Topic not found" });

    res.json(updatedTopic);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Topic Number already exists!" });
    }
    res.status(500).json({ error: err.message });
  }
};

// 4. DELETE: Cascade Delete
const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const topic = await Topic.findById(id);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    // Cleanup Questions
    await Question.deleteMany({ topic: id });

    // Delete Topic
    await Topic.findByIdAndDelete(id);

    res.json({ message: "Topic and its Questions deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. BULK UPLOAD
const addBulkTopics = async (req, res) => {
  try {
    const { topics } = req.body;

    if (!topics || topics.length === 0) {
      return res.status(400).json({ error: "No topics provided" });
    }

    // Insert Many (ordered: false allows partial success)
    const result = await Topic.insertMany(topics, { ordered: false });

    res.status(201).json({
      message: "Bulk upload successful",
      count: result.length,
      data: result,
    });
  } catch (error) {
    // Handle Partial Success (Some duplicates skipped)
    if (error.writeErrors) {
      return res.status(201).json({
        message: `Partial Success: ${error.insertedDocs.length} added. Others were duplicates.`,
        count: error.insertedDocs.length,
      });
    }
    console.error(error);
    res.status(500).json({ error: "Bulk upload failed" });
  }
};

module.exports = {
  addTopic,
  getTopicsByChapter,
  updateTopic,
  deleteTopic,
  addBulkTopics,
};
