const Subject = require("../models/subjectModel.js");
const cloudinary = require("../config/cloudinary");
// const fs = require("fs"); // <--- ISKI AB ZAROORAT NAHI HAI (Remove it)
const ClassLevel = require("../models/classLevel");
const Chapter = require("../models/chapter");
const Topic = require("../models/topic");
const Question = require("../models/question");

// --- HELPER FUNCTION: Buffer to Base64 ---
// Ye function image ko us format mein badalta hai jo Cloudinary ko chahiye
const bufferToDataURI = (buffer, mimetype) => {
  const b64 = Buffer.from(buffer).toString("base64");
  return "data:" + mimetype + ";base64," + b64;
};

// CREATE
const addSubject = async (req, res) => {
  try {
    // 1. Check file existence
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const { className, subjectName, year } = req.body;

    // 2. Duplicate Check
    const existingSubject = await Subject.findOne({ className, subjectName });

    if (existingSubject) {
      // Ab yahan fs.unlinkSync ki zaroorat nahi, kyunki file disk pe hai hi nahi
      return res
        .status(400)
        .json({ error: "This subject already exists in this class!" });
    }

    // 3. Convert Buffer to Base64 (Ram se format change)
    const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);

    // 4. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "subjects_images",
    });

    // 5. Save to DB
    const subject = new Subject({
      className,
      subjectName,
      year,
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });

    await subject.save();

    // fs.unlinkSync ki zaroorat nahi
    res.status(201).json(subject);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// READ (Get All) - No Change
const getSubjects = async (req, res) => {
  try {
    const { className } = req.query;
    const filter = className ? { className } : {};
    const subjects = await Subject.find(filter).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ (Single) - No Change
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE - No Change (Cloudinary logic same rahegi)
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    // 1. Cloudinary Cleanup
    if (subject.image && subject.image.public_id) {
      await cloudinary.uploader.destroy(subject.image.public_id);
    }

    // 2. Cascade Delete Logic
    const chapters = await Chapter.find({ subject: id });
    const chapterIds = chapters.map((c) => c._id);

    if (chapterIds.length > 0) {
      const topics = await Topic.find({ chapter: { $in: chapterIds } });
      const topicIds = topics.map((t) => t._id);

      if (topicIds.length > 0) {
        await Question.deleteMany({ topic: { $in: topicIds } });
        await Topic.deleteMany({ chapter: { $in: chapterIds } });
      }
      await Chapter.deleteMany({ subject: id });
    }

    await Subject.findByIdAndDelete(id);
    res.json({ message: "Subject and ALL related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE (Updated for Memory Storage)
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, subjectName, year } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    let updateData = { className, subjectName, year };

    // Check: New Image?
    if (req.file) {
      console.log("New image detected, updating...");

      // A. Delete Old Image from Cloudinary
      if (subject.image && subject.image.public_id) {
        await cloudinary.uploader.destroy(subject.image.public_id);
      }

      // B. Upload New Image (Buffer Logic)
      const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "subjects_images",
      });

      updateData.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };

      // fs.unlinkSync ki zaroorat nahi
    } else {
      console.log("No new image, keeping the old one.");
    }

    const updatedSubject = await Subject.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json(updatedSubject);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Class Logic (Add, Get, Update, Delete) - SAME AS BEFORE
// (Isko change karne ki zaroorat nahi kyunki ye images deal nahi kar raha directly)

const addClassLevel = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Class name is required" });
    const newClass = new ClassLevel({ name });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: "Class already exists" });
    res.status(500).json({ error: err.message });
  }
};

const getClassLevels = async (req, res) => {
  try {
    const classes = await ClassLevel.find().sort({ name: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateClassLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Class name is required" });
    const updatedClass = await ClassLevel.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updatedClass)
      return res.status(404).json({ error: "Class not found" });
    res.json(updatedClass);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: "This class name already exists" });
    res.status(500).json({ error: err.message });
  }
};

const deleteClassLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const classToDelete = await ClassLevel.findById(id);
    if (!classToDelete)
      return res.status(404).json({ error: "Class not found" });

    const className = classToDelete.name;
    const subjects = await Subject.find({ className: className });
    const subjectIds = subjects.map((sub) => sub._id);

    if (subjectIds.length > 0) {
      // Delete Cloudinary Images
      for (const sub of subjects) {
        if (sub.image && sub.image.public_id) {
          await cloudinary.uploader.destroy(sub.image.public_id);
        }
      }

      // Cascade Delete Logic (Same as before)
      const chapters = await Chapter.find({ subject: { $in: subjectIds } });
      const chapterIds = chapters.map((c) => c._id);
      if (chapterIds.length > 0) {
        const topics = await Topic.find({ chapter: { $in: chapterIds } });
        const topicIds = topics.map((t) => t._id);
        if (topicIds.length > 0) {
          await Question.deleteMany({ topic: { $in: topicIds } });
          await Topic.deleteMany({ chapter: { $in: chapterIds } });
        }
        await Chapter.deleteMany({ subject: { $in: subjectIds } });
      }
      await Subject.deleteMany({ _id: { $in: subjectIds } });
    }

    await ClassLevel.findByIdAndDelete(id);
    res.json({
      message: `Class '${className}' and ALL related data deleted successfully`,
    });
  } catch (err) {
    console.error("Delete Class Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// ✅ NEW: Get Full Details (Subject -> Chapters -> Topics)
const getFullSubjectDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch Subject
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    // 2. Fetch Chapters (Sorted by Number)
    const chapters = await Chapter.find({ subject: id }).sort({
      chapterNumber: 1,
    });

    // 3. Fetch Topics for ALL these chapters (Optimized Query)
    const chapterIds = chapters.map((c) => c._id);
    const topics = await Topic.find({ chapter: { $in: chapterIds } })
      .collation({ locale: "en", numericOrdering: true }) // Natural Sort (1.1, 1.2, 1.10)
      .sort({ topicNumber: 1 });

    // 4. Merge Topics into Chapters
    const hierarchy = chapters.map((chapter) => {
      // Find topics belonging to this chapter
      const chapterTopics = topics.filter(
        (t) => t.chapter.toString() === chapter._id.toString()
      );
      return {
        ...chapter.toObject(),
        topics: chapterTopics,
      };
    });

    res.json({ subject, hierarchy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  addSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  addClassLevel,
  getClassLevels,
  updateClassLevel,
  deleteClassLevel,
  getFullSubjectDetails,
};
