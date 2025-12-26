const User = require("../models/user");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// --- HELPER: Convert Buffer to Data URI ---
const bufferToDataURI = (buffer, mimetype) => {
  const b64 = Buffer.from(buffer).toString("base64");
  return "data:" + mimetype + ";base64," + b64;
};

// --- HELPER: Extract Public ID ---
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let path = parts[1];
    if (path.startsWith("v")) {
      const slashIndex = path.indexOf("/");
      if (slashIndex !== -1) path = path.substring(slashIndex + 1);
    }
    return path;
  } catch (error) {
    return null;
  }
};

// ... [Keep ALL existing functions: getAllUsers, addUser, updateUser, deleteUser, toggleUserStatus, updateProfile, updateProfileImage, deleteProfileImage, changePassword, uploadResume, deleteResume, getAdminProfile, updateBusinessInfo] ...
// (I am omitting the existing code to save space, but DO NOT DELETE IT. Add the following functions at the END of the file)

exports.getAllUsers = async (req, res) => {
  /* ... existing code ... */
};
exports.addUser = async (req, res) => {
  /* ... existing code ... */
};
exports.updateUser = async (req, res) => {
  /* ... existing code ... */
};
exports.deleteUser = async (req, res) => {
  /* ... existing code ... */
};
exports.toggleUserStatus = async (req, res) => {
  /* ... existing code ... */
};
exports.updateProfile = async (req, res) => {
  /* ... existing code ... */
};
exports.updateProfileImage = async (req, res) => {
  /* ... existing code ... */
};
exports.deleteProfileImage = async (req, res) => {
  /* ... existing code ... */
};
exports.changePassword = async (req, res) => {
  /* ... existing code ... */
};
exports.uploadResume = async (req, res) => {
  /* ... existing code ... */
};
exports.deleteResume = async (req, res) => {
  /* ... existing code ... */
};
exports.getAdminProfile = async (req, res) => {
  /* ... existing code ... */
};
exports.updateBusinessInfo = async (req, res) => {
  /* ... existing code ... */
};

// ==========================================
// 14. UPDATE INSTITUTE INFO (Text Only)
// ==========================================
exports.updateInstituteInfo = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Preserve existing logo, update text fields
    user.institute = {
      ...user.institute, // Keep existing logo
      name: name || "",
      address: address || "",
      phone: phone || "",
    };

    await user.save();

    res.json({
      message: "Institute details updated",
      institute: user.institute,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update institute info" });
  }
};

// ==========================================
// 15. UPDATE INSTITUTE LOGO
// ==========================================
exports.updateInstituteLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file provided" });
    }

    const user = await User.findById(req.user._id);

    // Delete Old Logo if exists
    if (user.institute?.logo && user.institute.logo.includes("cloudinary")) {
      const fullId = getPublicIdFromUrl(user.institute.logo);
      const publicId = fullId ? fullId.split(".")[0] : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Upload New Logo
    const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "questbank/institute_logos",
      width: 300,
      crop: "scale",
    });

    // Update DB
    user.institute.logo = result.secure_url;
    await user.save();

    res.json({
      message: "Institute logo updated",
      logo: user.institute.logo,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Logo upload failed", error: error.message });
  }
};

// ==========================================
// 16. DELETE INSTITUTE LOGO
// ==========================================
exports.deleteInstituteLogo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.institute?.logo && user.institute.logo.includes("cloudinary")) {
      const fullId = getPublicIdFromUrl(user.institute.logo);
      const publicId = fullId ? fullId.split(".")[0] : null;

      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      user.institute.logo = "";
      await user.save();

      res.json({
        message: "Institute logo removed",
        logo: "",
      });
    } else {
      res.status(400).json({ message: "No logo to delete" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
