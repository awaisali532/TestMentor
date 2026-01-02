const User = require("../models/user"); // Ensure filename matches your User model file
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const deleteFromCloudinary = require("../utils/cloudinaryHelper"); // ✅ Import Helper
// --- HELPER: Convert Buffer to Data URI (For Images) ---
const bufferToDataURI = (buffer, mimetype) => {
  const b64 = Buffer.from(buffer).toString("base64");
  return "data:" + mimetype + ";base64," + b64;
};

// --- HELPER: Extract Public ID from Cloudinary URL ---
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let path = parts[1]; // e.g. "v1234/folder/file.ext"

    // Remove version prefix if exists
    if (path.startsWith("v")) {
      const slashIndex = path.indexOf("/");
      if (slashIndex !== -1) path = path.substring(slashIndex + 1);
    }
    // Remove extension ONLY for images (Cloudinary raw files keep extension in ID usually)
    // But for safety in this controller, we handle extension removal logic based on resource_type later.
    return path;
  } catch (error) {
    return null;
  }
};

// ==========================================
// 1. GET ALL USERS (Admin)
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users list." });
  }
};

// ==========================================
// 2. ADD NEW USER (Admin)
// ==========================================
exports.addUser = async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email already exists." });

    const user = await User.create({
      name,
      email,
      password, // Model middleware will hash this
      role, // 'admin' or 'user' (from modal)
      isActive: true,
      permissions: role === "admin" ? permissions : [],
      // Defaults from schema will handle planType='free', etc.
    });

    const userResponse = await User.findById(user._id).select("-password");
    res
      .status(201)
      .json({ message: "User created successfully", user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 3. UPDATE USER INFO (Admin)
// ==========================================
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

// ==========================================
// 4. DELETE USER (Admin)
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    console.log(`⚠️ Deleting User: ${user.email}`);

    // 1. Delete Profile Image
    if (user.image && user.image.includes("cloudinary")) {
      await deleteFromCloudinary(user.image);
    }

    // 2. Delete Institute Logo
    // Check karein ke institute object exist karta hai
    if (
      user.institute &&
      user.institute.logo &&
      user.institute.logo.includes("cloudinary")
    ) {
      await deleteFromCloudinary(user.institute.logo);
    }

    // 3. Delete Resume (Agar Admin hai)
    if (user.resume && user.resume.includes("cloudinary")) {
      await deleteFromCloudinary(user.resume);
    }

    // 4. Finally Delete User form DB
    await User.findByIdAndDelete(req.params.id);

    console.log("✅ User Deleted Successfully");
    res.json({ message: "User and associated files deleted successfully." });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// ==========================================
// 5. TOGGLE USER STATUS (Block/Unblock)
// ==========================================
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

// ==========================================
// 6. UPDATE PROFILE (Self)
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (req.body.name) user.name = req.body.name;

    // Image Upload Logic
    if (req.file) {
      try {
        if (user.image && user.image.includes("cloudinary")) {
          const oldIdWithExt = getPublicIdFromUrl(user.image);
          const oldId = oldIdWithExt ? oldIdWithExt.split(".")[0] : null;
          if (oldId) await cloudinary.uploader.destroy(oldId);
        }

        const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "questbank/avatars",
          width: 300,
          crop: "scale",
        });
        user.image = result.secure_url;
      } catch (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ error: "Image upload failed." });
      }
    }

    const updatedUser = await user.save();

    // ✅ FIX: Response mein Institute Data wapis bhejna zaroori hai
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      image: updatedUser.image,
      resume: updatedUser.resume,
      isSuperAdmin: updatedUser.isSuperAdmin,
      permissions: updatedUser.permissions,
      planType: updatedUser.planType,
      usage: updatedUser.usage,
      subscription: updatedUser.subscription,

      // 👇 YE MISSING THA (Isay Add Karein)
      institute: updatedUser.institute || {
        name: "",
        address: "",
        phone: "",
        logo: "",
      },

      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    res.status(500).json({ error: "Profile update failed." });
  }
};
// ==========================================
// 7. UPDATE PROFILE IMAGE (Dedicated Route)
// ==========================================
exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const user = await User.findById(req.user._id);

    // Delete Old Image
    if (user.image && user.image.includes("cloudinary")) {
      const fullId = getPublicIdFromUrl(user.image);
      const publicId = fullId ? fullId.split(".")[0] : null; // Remove extension for images
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Multer Cloudinary Storage automatically uploads, so req.file.path is the URL
    // IF you are using 'multer-storage-cloudinary'.
    // IF you are using memory storage (buffer), use streamifier like below:

    // Assuming Memory Storage for consistency with Resume logic:
    const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "questbank/avatars",
      width: 300,
      crop: "scale",
    });

    user.image = result.secure_url;
    await user.save();

    res.json({
      success: true,
      message: "Profile image updated successfully!",
      image: user.image,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==========================================
// 8. DELETE PROFILE IMAGE (Remove)
// ==========================================
exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.image && user.image.includes("cloudinary")) {
      const fullId = getPublicIdFromUrl(user.image);
      const publicId = fullId ? fullId.split(".")[0] : null;

      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      user.image = "";
      await user.save();

      res.json({
        success: true,
        message: "Profile image removed!",
        image: "",
      });
    } else {
      res.status(400).json({ message: "No profile image to delete." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==========================================
// 9. CHANGE PASSWORD
// ==========================================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await user.matchPassword(oldPassword); // Use model method
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect current password." });

    if (newPassword.length < 6)
      return res.status(400).json({ error: "New password too short." });

    user.password = newPassword; // Pre-save hook handles hashing
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Password update failed." });
  }
};

// ==========================================
// 10. UPLOAD RESUME (Admin Only - RAW Mode)
// ==========================================
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
          // Try both types to ensure deletion
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
            resource_type: "raw", // ✅ RAW: Avoids 401 Unauthorized
            public_id: `resume_${req.user._id}.pdf`, // Force extension in ID
            format: "pdf",
            type: "upload",
            access_mode: "public",
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
    });
  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ message: "Server Error uploading resume" });
  }
};

// ==========================================
// 11. DELETE RESUME (Admin Only)
// ==========================================
exports.deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.resume) {
      const publicId = getPublicIdFromUrl(user.resume);
      if (publicId) {
        try {
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
    await user.save();

    res.json({
      message: "Resume removed successfully",
      resume: "",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove resume." });
  }
};

// ==========================================
// 12. GET ADMIN PROFILE (Public Access)
// ==========================================
exports.getAdminProfile = async (req, res) => {
  try {
    // Finds the first Super Admin
    const admin = await User.findOne({ isSuperAdmin: true }).select(
      "name email image resume role businessInfo"
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin profile not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
};

// ==========================================
// 13. UPDATE BUSINESS INFO (Super Admin)
// ==========================================
exports.updateBusinessInfo = async (req, res) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update settings" });
    }

    const { phone, officeAddress, supportEmail } = req.body;
    const user = await User.findById(req.user._id);

    user.businessInfo = {
      phone: phone || user.businessInfo.phone,
      officeAddress: officeAddress || user.businessInfo.officeAddress,
      supportEmail: supportEmail || user.businessInfo.supportEmail,
    };

    await user.save();

    res.json({
      message: "Business details updated successfully",
      businessInfo: user.businessInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update business info" });
  }
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

    const updatedUser = await user.save();

    res.json({
      message: "Institute details updated",
      institute: updatedUser.institute,
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
    const updatedUser = await user.save();

    res.json({
      message: "Institute logo updated",
      logo: updatedUser.institute.logo,
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
      const updatedUser = await user.save();

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
