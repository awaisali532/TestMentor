const User = require("../models/user");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const deleteFromCloudinary = require("../utils/cloudinaryHelper");

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

// ==========================================
// 1. GET ALL USERS (Admin - Enhanced)
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    // Password hata kar baki sab data bhejo (Usage, Plan, Verification status)
    const users = await User.find()
      .select("-password -otp -otpExpires -otpAttempts")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users list." });
  }
};

// ==========================================
// 2. ADMIN CREATE USER (Direct Verified)
// ==========================================
exports.adminCreateUser = async (req, res) => {
  // ✅ gender receive ho raha hai yahan
  const { name, email, password, role, planType, gender } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email already exists." });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      isActive: true,
      isVerified: true,
      planType: planType || "free",
      // ✅ Gender save ho raha hai
      gender: gender || "Not Specified",
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 3. TOGGLE VERIFICATION (Manual Approve)
// ==========================================
exports.toggleVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Toggle Verification Status
    user.isVerified = !user.isVerified;

    // Agar verify kar rahe hain to OTP/Block clear kar do
    if (user.isVerified) {
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      user.blockUntil = null;
    }

    await user.save();
    res.json({
      message: `User verification set to ${user.isVerified}`,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update verification status." });
  }
};

// ==========================================
// 4. MANAGE PLAN (Upgrade/Downgrade + Expiry)
// ==========================================
exports.updateUserPlan = async (req, res) => {
  const { planType, validUntil } = req.body; // e.g. "paid", "2025-12-31"

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.planType = planType;

    // Subscription Logic
    if (planType === "paid") {
      user.subscription.status = true;
      user.subscription.validUntil = validUntil ? new Date(validUntil) : null;
    } else {
      user.subscription.status = false;
      user.subscription.validUntil = null;
    }

    await user.save();
    res.json({
      message: `Plan updated to ${planType}`,
      planType: user.planType,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update plan." });
  }
};

// ==========================================
// 5. RESET/UPDATE LIMITS (Enhanced)
// ==========================================
exports.resetUserLimits = async (req, res) => {
  // ✅ customPaperLimit receive kar rahe hain
  const { papersGenerated, onlineTestsTaken, customPaperLimit } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Update Counts
    if (papersGenerated !== undefined)
      user.usage.papersGenerated = papersGenerated;
    if (onlineTestsTaken !== undefined)
      user.usage.onlineTestsTaken = onlineTestsTaken;

    // ✅ Update Custom Limit (Problem 2 Solved)
    // Agar frontend se null ya value aayi hai to update karo
    if (customPaperLimit !== undefined) {
      user.usage.customPaperLimit = customPaperLimit;
    }

    await user.save();

    res.json({
      message: "User limits and quotas updated successfully",
      usage: user.usage,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update limits." });
  }
};
// ==========================================
// 6. TOGGLE STATUS (Block/Unblock)
// ==========================================
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.isActive = !user.isActive;

    // Agar unblock kar rahe hain to 'blockUntil' bhi clear karo
    if (user.isActive) {
      user.blockUntil = null;
      user.otpAttempts = 0;
    }

    await user.save();
    res.json({
      message: `User is now ${user.isActive ? "Active" : "Blocked"}`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ error: "Status update failed." });
  }
};

// ==========================================
// 7. DELETE USER (Complete Cleanup)
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // 1. Delete Images/Resumes from Cloudinary
    if (user.image?.includes("cloudinary"))
      await deleteFromCloudinary(user.image);
    if (user.resume?.includes("cloudinary"))
      await deleteFromCloudinary(user.resume);
    if (user.institute?.logo?.includes("cloudinary"))
      await deleteFromCloudinary(user.institute.logo);

    // 2. Delete User
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// ==========================================================
//  EXISTING FUNCTIONS (UNCHANGED - RESUME, LOGO, PROFILE)
// ==========================================================

// ... (Baaki saare purane functions neeche paste karo: updateProfile, updateInstituteLogo, uploadResume etc.)
// Main unhein yahan repeat nahi kar raha taake response lamba na ho.
// Bas make sure karna ke upar wale naye functions add ho jayein.

// ==========================================
// UPDATE PROFILE (Self) - Optimized Response
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
          await deleteFromCloudinary(user.image);
        }
        const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "questbank/avatars",
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
      isVerified: updatedUser.isVerified, // ✅ Added
      planType: updatedUser.planType, // ✅ Added
      usage: updatedUser.usage, // ✅ Added
      subscription: updatedUser.subscription, // ✅ Added
      institute: updatedUser.institute || {},
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    res.status(500).json({ error: "Profile update failed." });
  }
};

// ... (Baaki saare Resume, Institute Logo, Password Change wese hi rahenge)
exports.changePassword = async (req, res) => {
  // ... Existing Code ...
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
exports.uploadResume = async (req, res) => {
  // ... Existing Code ...
  try {
    // 1. Validation
    if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });
    if (req.file.mimetype !== "application/pdf")
      return res.status(400).json({ message: "Only PDF files allowed" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Delete old file logic
    if (user.resume) {
      await deleteFromCloudinary(user.resume);
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
          },
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
exports.deleteResume = async (req, res) => {
  // ... Existing Code ...
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.resume) {
      await deleteFromCloudinary(user.resume);
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
exports.updateInstituteLogo = async (req, res) => {
  // ... Existing Code ...
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file provided" });
    }

    const user = await User.findById(req.user._id);

    // Delete Old Logo if exists
    if (user.institute?.logo) {
      await deleteFromCloudinary(user.institute.logo);
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
// Add other existing functions (updateBusinessInfo, updateInstituteInfo, etc.) here...
exports.getAdminProfile = async (req, res) => {
  try {
    // Finds the first Super Admin
    const admin = await User.findOne({ isSuperAdmin: true }).select(
      "name email image resume role businessInfo",
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
// 16. DELETE INSTITUTE LOGO
// ==========================================
exports.deleteInstituteLogo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.institute?.logo && user.institute.logo.includes("cloudinary")) {
      await deleteFromCloudinary(user.institute.logo);

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
exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const user = await User.findById(req.user._id);

    // Delete Old Image
    if (user.image) {
      await deleteFromCloudinary(user.image);
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

    if (user.image) {
      await deleteFromCloudinary(user.image);
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
// 17. UPDATE USER BASIC INFO (Admin)
// ==========================================
exports.updateUser = async (req, res) => {
  try {
    // 1. Destructure ALL fields (Gender, Plan, Verification added)
    const {
      name,
      email,
      role,
      permissions,
      gender, // ✅ Fix: Receive Gender
      planType, // ✅ Fix: Receive Plan
      isVerified, // ✅ Fix: Receive Status
      password, // ✅ Fix: Optional Password change
    } = req.body;

    // 2. Find User
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // 3. Update Fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    // 🔥 YE LINE MISSING THI, ISLIYE SAVE NHI HO RHA THA
    user.gender = gender || user.gender;

    user.planType = planType || user.planType;

    // Handle Boolean Toggle (isVerified)
    if (isVerified !== undefined) {
      user.isVerified = isVerified;
    }

    // 4. Handle Permissions (Only for Admin)
    if (role === "admin") {
      user.permissions = permissions || user.permissions;
    } else {
      user.permissions = [];
    }

    // 5. Handle Password (Optional from Admin Panel)
    if (password && password.trim() !== "") {
      user.password = password; // Pre-save hook will hash this
    }

    // 6. Save User
    const updatedUser = await user.save();

    // Return response without sensitive data
    const responseData = updatedUser.toObject();
    delete responseData.password;

    res.json(responseData);
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ error: "Failed to update user details." });
  }
};
