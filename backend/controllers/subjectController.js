const Subject = require("../models/subjectModel.js");
// Cloudinary config file import karo (jahan tumne API keys rakhi hain)
const cloudinary = require("../config/cloudinary");
const fs = require("fs"); // File delete karne ke liye (Node native module)
const ClassLevel = require("../models/classLevel");
const Chapter = require("../models/Chapter");
const Topic = require("../models/topic");
const Question = require("../models/question");

// CREATE
const addSubject = async (req, res) => {
  try {
    // 1. Sabse pehle check karo ke file aayi hai ya nahi
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const { className, subjectName, year } = req.body;

    // --- NEW LOGIC START (Optimization) ---

    // 2. Cloudinary jane se pehle Database check karo
    const existingSubject = await Subject.findOne({ className, subjectName });

    if (existingSubject) {
      // Agar duplicate mil gaya:
      // A. Local folder (uploads/) se file delete karo
      fs.unlinkSync(req.file.path);

      // B. Error return karo (Cloudinary upload skip ho gaya!)
      return res
        .status(400)
        .json({ error: "This subject already exists in this class!" });
    }

    // --- NEW LOGIC END ---

    // 3. Ab sab clear hai, to Cloudinary par upload karo
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "subjects_images",
    });

    // 4. Database mein save karo
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

    // 5. Local file cleanup
    fs.unlinkSync(req.file.path);

    res.status(201).json(subject);
  } catch (err) {
    // Error handling
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// READ (Get All)
const getSubjects = async (req, res) => {
  try {
    const { className } = req.query;
    const filter = className ? { className } : {};
    const subjects = await Subject.find(filter).sort({ createdAt: -1 }); // Latest pehle
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ (Single) - Same as yours
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE (Most Important Change)
// DELETE SUBJECT (FULL CLEANUP)
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params; // Subject ID

    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    // 1. Cloudinary se Subject Image delete (Already tha)
    if (subject.image && subject.image.public_id) {
      await cloudinary.uploader.destroy(subject.image.public_id);
    }

    // --- CASCADE DELETE LOGIC START ---

    // A. Is subject ke saare Chapters dhundo
    const chapters = await Chapter.find({ subject: id });
    const chapterIds = chapters.map((c) => c._id);

    if (chapterIds.length > 0) {
      // B. Un Chapters ke saare Topics dhundo
      const topics = await Topic.find({ chapter: { $in: chapterIds } });
      const topicIds = topics.map((t) => t._id);

      if (topicIds.length > 0) {
        // C. Sab se pehle QUESTIONS delete karo (Level 3)
        await Question.deleteMany({ topic: { $in: topicIds } });

        // D. Phir TOPICS delete karo (Level 2)
        await Topic.deleteMany({ chapter: { $in: chapterIds } });
      }

      // E. Phir CHAPTERS delete karo (Level 1)
      await Chapter.deleteMany({ subject: id });
    }
    // --- CASCADE DELETE LOGIC END ---

    // 2. Finally SUBJECT delete karo (Root)
    await Subject.findByIdAndDelete(id);

    res.json({ message: "Subject and ALL related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE (Logic change needed)
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    // Sirf text fields nikalo body se
    const { className, subjectName, year } = req.body;

    // 1. Database mein subject dhundo
    const subject = await Subject.findById(id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    // 2. Update Object banao (Sirf text data ke sath)
    let updateData = { className, subjectName, year };

    // --- SMART IMAGE LOGIC ---

    // Check: Kya user ne nayi image bheji hai?
    if (req.file) {
      console.log("New image detected, updating...");

      // A. Agar purani image Cloudinary par hai, to usay delete karo
      if (subject.image && subject.image.public_id) {
        await cloudinary.uploader.destroy(subject.image.public_id);
      }

      // B. Nayi image upload karo
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "subjects_images",
      });

      // C. updateData mein image add karo
      updateData.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };

      // D. Local folder se safai
      fs.unlinkSync(req.file.path);
    } else {
      console.log("No new image, keeping the old one.");
    }

    // -------------------------

    // 3. Final Database Update
    const updatedSubject = await Subject.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json(updatedSubject);
  } catch (err) {
    // Agar error aaye aur file upload ho chuki ho locally, to delete kar do
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// 1. Add Class
const addClassLevel = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Class name is required" });

    // Ab ye 'new ClassLevel' dekhne mein professional lag raha hai
    const newClass = new ClassLevel({ name });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: "Class already exists" });
    res.status(500).json({ error: err.message });
  }
};

// 2. Get All Classes
const getClassLevels = async (req, res) => {
  try {
    // Variable use karte waqt bhi Capital
    const classes = await ClassLevel.find().sort({ name: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 3. Update Class Name
const updateClassLevel = async (req, res) => {
  try {
    const { id } = req.params; // Class ki ID URL se ayegi
    const { name } = req.body; // Naya naam body se ayega

    if (!name) return res.status(400).json({ error: "Class name is required" });

    const updatedClass = await ClassLevel.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Return updated document
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
// 4. Delete Class (GRAND CASCADE DELETE)
const deleteClassLevel = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Pehle Class dhundo (Kyunke humein uska NAAM chahiye)
    const classToDelete = await ClassLevel.findById(id);
    if (!classToDelete)
      return res.status(404).json({ error: "Class not found" });

    const className = classToDelete.name; // e.g., "9th Class"

    // 2. Is Class ke saare SUBJECTS dhundo
    const subjects = await Subject.find({ className: className });
    const subjectIds = subjects.map((sub) => sub._id);

    // Agar Subjects mile, to safai shuru karo
    if (subjectIds.length > 0) {
      // A. Pehle Cloudinary se Images saaf karo (Loop chala kar)
      for (const sub of subjects) {
        if (sub.image && sub.image.public_id) {
          await cloudinary.uploader.destroy(sub.image.public_id);
        }
      }

      // B. Ab Chapters dhundo jo in Subjects ke hain
      const chapters = await Chapter.find({ subject: { $in: subjectIds } });
      const chapterIds = chapters.map((c) => c._id);

      if (chapterIds.length > 0) {
        // C. Ab Topics dhundo
        const topics = await Topic.find({ chapter: { $in: chapterIds } });
        const topicIds = topics.map((t) => t._id);

        if (topicIds.length > 0) {
          // D. Sabse pehle QUESTIONS delete (Level 4)
          await Question.deleteMany({ topic: { $in: topicIds } });

          // E. Phir TOPICS delete (Level 3)
          await Topic.deleteMany({ chapter: { $in: chapterIds } });
        }

        // F. Phir CHAPTERS delete (Level 2)
        await Chapter.deleteMany({ subject: { $in: subjectIds } });
      }

      // G. Phir SUBJECTS delete (Level 1)
      await Subject.deleteMany({ _id: { $in: subjectIds } });
    }

    // 3. Akhir mein CLASS delete (Root Level)
    await ClassLevel.findByIdAndDelete(id);

    res.json({
      message: `Class '${className}' and ALL related data deleted successfully`,
    });
  } catch (err) {
    console.error("Delete Class Error:", err);
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
};
