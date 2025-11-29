const Subject = require("../models/subjectModel.js");
// Cloudinary config file import karo (jahan tumne API keys rakhi hain)
const cloudinary = require("../config/cloudinary");
const fs = require("fs"); // File delete karne ke liye (Node native module)
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
const deleteSubject = async (req, res) => {
  try {
    // 1. Pehle subject dhundo
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    // 2. Cloudinary se image delete karo
    if (subject.image && subject.image.public_id) {
      await cloudinary.uploader.destroy(subject.image.public_id);
    }

    // 3. Ab Database se delete karo
    await Subject.findByIdAndDelete(req.params.id);

    res.json({ message: "Subject and Image deleted successfully" });
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

module.exports = {
  addSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
