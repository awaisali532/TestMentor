const Topic = require("../models/topic");
const Question = require("../models/question");
// 1. CREATE: Add New Topic
const addTopic = async (req, res) => {
  try {
    const { chapterId, topicNumber, name, description } = req.body;

    // Validation
    if (!chapterId || !topicNumber || !name) {
      return res
        .status(400)
        .json({ error: "Chapter, Topic Number, and Name are required" });
    }

    // Logic: Database mein save karo
    const newTopic = new Topic({
      chapter: chapterId, // Frontend se hum chapterId bhejenge
      topicNumber,
      name,
      description,
    });

    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    // Duplicate Error Handling
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "This topic number already exists in this chapter!" });
    }
    res.status(500).json({ error: err.message });
  }
};

// 2. READ: Get Topics by Chapter ID
const getTopicsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params; // URL se chapter ID ayegi

    // Logic: Sirf wo topics laao jinki chapter ID match kare, aur sort karo
    const topics = await Topic.find({ chapter: chapterId }).sort({
      topicNumber: 1,
    });

    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. UPDATE: Edit Topic Name/Number
const updateTopic = async (req, res) => {
  try {
    const { id } = req.params; // Topic ki ID
    const { topicNumber, name, description } = req.body; // Naya data

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      { topicNumber, name, description },
      { new: true } // new: true ka matlab hai updated data wapis karo
    );

    if (!updatedTopic)
      return res.status(404).json({ error: "Topic not found" });

    res.json(updatedTopic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. DELETE TOPIC (WITH CASCADE DELETE)
const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Pehle check karo Topic hai bhi ya nahi
    const topic = await Topic.findById(id);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    // 2. 🔥 CLEANUP: Is Topic ke saare sawal delete karo
    // Cloudinary se images delete karna bohot heavy ho jayega,
    // filhal hum sirf database se records ura rahe hain.
    await Question.deleteMany({ topic: id });

    // 3. Ab Topic delete karo
    await Topic.findByIdAndDelete(id);

    res.json({ message: "Topic and all its Questions deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addTopic, getTopicsByChapter, updateTopic, deleteTopic };
