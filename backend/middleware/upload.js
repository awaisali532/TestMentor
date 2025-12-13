const multer = require("multer");
const path = require("path");

// CHANGE: diskStorage ki jagah memoryStorage (Vercel ke liye zaroori)
const storage = multer.memoryStorage();

// File Filter (Same rahega)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
