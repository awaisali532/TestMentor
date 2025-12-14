const multer = require("multer");

// Keep memoryStorage for Vercel/Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // ✅ Allow Images OR PDFs
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type! Please upload an image or PDF."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit to 5MB
});

module.exports = upload;
