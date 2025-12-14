const User = require("../models/user"); // Ensure filename matches (User.js)
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier"); // ✅ MUST BE INSTALLED

// --- HELPER: Convert Buffer to Data URI (ONLY FOR IMAGES) ---
const bufferToDataURI = (buffer, mimetype) => {
  const b64 = Buffer.from(buffer).toString("base64");
  return "data:" + mimetype + ";base64," + b64;
};

// ✅ HELPER: Extract Public ID (Robust for Raw/Image)
const getPublicIdFromUrl = (url) => {
  try {
    // Splits at '/upload/'
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    let path = parts[1]; // e.g., "v12345/resumes/resume_123.pdf" or "resumes/resume_123.pdf"

    // Remove version "v1234/" if it exists
    if (path.startsWith("v")) {
      const slashIndex = path.indexOf("/");
      if (slashIndex !== -1) {
        path = path.substring(slashIndex + 1);
      }
    }

    return path;
  } catch (error) {
    return null;
  }
};
// 1. Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users list." });
  }
};

// 2. Add New User
exports.addUser = async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email already exists." });

    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true,
      permissions: role === "admin" ? permissions : [],
    });

    const userResponse = await User.findById(user._id).select("-password");
    res
      .status(201)
      .json({ message: "User created successfully", user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Update User Info
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, permissions } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, permissions: role === "admin" ? permissions : [] },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found." });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user details." });
  }
};

// 4. DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// 5. Toggle Status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User status updated.` });
  } catch (error) {
    res.status(500).json({ error: "Status update failed." });
  }
};

// 6. UPDATE PROFILE (Images use Data URI)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (req.body.name) user.name = req.body.name;

    if (req.file) {
      try {
        if (user.image && user.image.includes("cloudinary")) {
          const oldId = getPublicIdFromUrl(user.image);
          if (oldId) await cloudinary.uploader.destroy(oldId);
        }
        const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "avatars",
          width: 300,
          crop: "scale",
        });
        user.image = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ error: "Image upload failed." });
      }
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      image: updatedUser.image,
      resume: updatedUser.resume,
      isSuperAdmin: updatedUser.isSuperAdmin,
      permissions: updatedUser.permissions,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    res.status(500).json({ error: "Profile update failed." });
  }
};

// 7. REMOVE PROFILE IMAGE
exports.removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.image) {
      const publicId = getPublicIdFromUrl(user.image);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }
    user.image = "";
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      image: "",
      resume: updatedUser.resume,
      isSuperAdmin: updatedUser.isSuperAdmin,
      permissions: updatedUser.permissions,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove image." });
  }
};

// 8. CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect current password." });
    if (newPassword.length < 6)
      return res.status(400).json({ error: "New password too short." });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Password update failed." });
  }
};
// ✅ 9. UPLOAD RESUME (Using RAW Stream - Avoids 401 & Corruption)
exports.uploadResume = async (req, res) => {
  try {
    // 1. Validation
    if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });
    if (req.file.mimetype !== "application/pdf")
      return res.status(400).json({ message: "Only PDF files allowed" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Delete old file logic
    if (user.resume) {
      const oldPublicId = getPublicIdFromUrl(user.resume);
      if (oldPublicId) {
        try {
          // Delete both types to clean up any mess from previous attempts
          await cloudinary.uploader.destroy(oldPublicId, {
            resource_type: "raw",
          });
          await cloudinary.uploader.destroy(oldPublicId, {
            resource_type: "image",
          });
        } catch (err) {
          console.error("Cleanup error (ignored):", err.message);
        }
      }
    }

    // 3. Upload Stream (RAW Mode)
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "resumes",
            // ✅ RAW: This avoids the 401 Unauthorized error for PDFs
            resource_type: "raw",
            public_id: `resume_${req.user._id}.pdf`, // Force extension in ID
            format: "pdf",
            type: "upload", // Explicitly Public
            access_mode: "public", // Explicitly Public
            overwrite: true,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);

    // 4. Save Link to DB
    user.resume = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Resume updated successfully",
      resume: user.resume,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        resume: user.resume,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ message: "Server Error uploading resume" });
  }
};

// ✅ 10. DELETE RESUME (Updated for RAW)
exports.deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.resume) {
      const publicId = getPublicIdFromUrl(user.resume);
      if (publicId) {
        try {
          // Delete 'raw' mainly, but try 'image' too just in case
          await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        } catch (cloudError) {
          console.error("Cloudinary Delete Error:", cloudError);
        }
      }
    }

    user.resume = "";
    const updatedUser = await user.save();

    res.json({
      message: "Resume removed successfully",
      resume: "",
      user: { ...updatedUser._doc },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove resume." });
  }
};
