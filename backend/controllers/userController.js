const User = require("../models/user");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

// --- HELPER: Extract Public ID ---
const getPublicIdFromUrl = (url) => {
  try {
    const splitUrl = url.split("/");
    const lastSegment = splitUrl[splitUrl.length - 1];
    const fileName = lastSegment.split(".")[0];
    const folder = "avatars";
    return `${folder}/${fileName}`;
  } catch (error) {
    return null;
  }
};

// 1. Get All Users (Keep as is)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ error: "Failed to fetch users list." });
  }
};

// 2. Add New User (Keep as is)
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

// 3. Update User Info (Keep as is)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, permissions } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, permissions: role === "admin" ? permissions : [] },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ error: "User not found to update." });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user details." });
  }
};

// 4. DELETE USER (Keep as is - Logic was correct)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.image && user.image.includes("cloudinary")) {
      const publicId = getPublicIdFromUrl(user.image);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudError) {
          console.error("Failed to delete Cloudinary image:", cloudError);
        }
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User and associated data deleted successfully." });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// 5. Toggle Status (Keep as is)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.isActive = !user.isActive;
    await user.save();

    const status = user.isActive ? "Active" : "Banned";
    res.json({ message: `User status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ error: "Status update failed." });
  }
};

// ✅ 6. UPDATE PROFILE (Updated Return Data)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (req.body.name) user.name = req.body.name;

    if (req.file) {
      try {
        // Delete old image if exists
        if (user.image && user.image.includes("cloudinary")) {
          const oldId = getPublicIdFromUrl(user.image);
          if (oldId) await cloudinary.uploader.destroy(oldId);
        }

        // Upload new
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "avatars",
          width: 300,
          crop: "scale",
        });
        user.image = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Error:", uploadError);
        return res
          .status(500)
          .json({ error: "Image upload failed. Please try again." });
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      image: updatedUser.image,
      // 🔥 FIX: Send these back so permissions don't break on frontend
      isSuperAdmin: updatedUser.isSuperAdmin,
      permissions: updatedUser.permissions,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: "Profile update failed." });
  }
};

// ✅ 7. REMOVE PROFILE IMAGE (New Function)
exports.removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.image && user.image.includes("cloudinary")) {
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
      // 🔥 FIX: Send permissions back here too
      isSuperAdmin: updatedUser.isSuperAdmin,
      permissions: updatedUser.permissions,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    console.error("Remove Image Error:", error);
    res.status(500).json({ error: "Failed to remove image." });
  }
};

// 8. CHANGE PASSWORD (Keep as is)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ error: "Password update failed." });
  }
};
