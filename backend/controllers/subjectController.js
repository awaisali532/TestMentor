const Subject = require("../models/subjectModel.js");

const addSubject = async (req, res) => {
  try {
    const { className, subjectName, year, imageUrl } = req.body;

    if (!className || !subjectName || !year || !imageUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const subject = new Subject({ className, subjectName, year, imageUrl });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ: Get all subjects or by className filter
const getSubjects = async (req, res) => {
  try {
    const { className } = req.query;
    const filter = className ? { className } : {};
    const subjects = await Subject.find(filter);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ: Get single subject by ID
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE: Modify subject by ID
const updateSubject = async (req, res) => {
  try {
    const { className, subjectName, year, imageUrl } = req.body;
    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      { className, subjectName, year, imageUrl },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Subject not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Remove subject by ID
const deleteSubject = async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Subject not found" });
    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
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
