const User = require("../models/user");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const deleteFromCloudinary = require("../utils/cloudinaryHelper");

const bufferToDataURI = (buffer, mimetype) => {
  const b64 = Buffer.from(buffer).toString("base64");
  return "data:" + mimetype + ";base64," + b64;
};

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -otp -otpExpires -otpAttempts")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users list." });
  }
};

exports.adminCreateUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    planType,
    gender,
    canAccessPracticeMode,
  } = req.body;
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
      gender: gender || "Not Specified",

      canAccessPracticeMode: canAccessPracticeMode || false,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.isVerified = !user.isVerified;

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

exports.updateUserPlan = async (req, res) => {
  const { planType, validUntil } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.planType = planType;

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

exports.resetUserLimits = async (req, res) => {
  const { papersGenerated, onlineTestsTaken, customPaperLimit } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (papersGenerated !== undefined)
      user.usage.papersGenerated = papersGenerated;
    if (onlineTestsTaken !== undefined)
      user.usage.onlineTestsTaken = onlineTestsTaken;

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

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.isActive = !user.isActive;

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

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.image?.includes("cloudinary"))
      await deleteFromCloudinary(user.image);
    if (user.resume?.includes("cloudinary"))
      await deleteFromCloudinary(user.resume);
    if (user.institute?.logo?.includes("cloudinary"))
      await deleteFromCloudinary(user.institute.logo);

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (req.body.name) user.name = req.body.name;

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
      isVerified: updatedUser.isVerified,
      planType: updatedUser.planType,
      usage: updatedUser.usage,
      subscription: updatedUser.subscription,
      institute: updatedUser.institute || {},

      canAccessPracticeMode: updatedUser.canAccessPracticeMode,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    res.status(500).json({ error: "Profile update failed." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await user.matchPassword(oldPassword);
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
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });
    if (req.file.mimetype !== "application/pdf")
      return res.status(400).json({ message: "Only PDF files allowed" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resume) {
      await deleteFromCloudinary(user.resume);
    }

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
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file provided" });
    }

    const user = await User.findById(req.user._id);

    if (user.institute?.logo) {
      await deleteFromCloudinary(user.institute.logo);
    }

    const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "questbank/institute_logos",
      width: 300,
      crop: "scale",
    });

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

exports.getAdminProfile = async (req, res) => {
  try {
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

exports.updateInstituteInfo = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.institute = {
      ...user.institute,
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

    if (user.image) {
      await deleteFromCloudinary(user.image);
    }

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

exports.updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      permissions,
      gender,
      planType,
      isVerified,
      password,
      canAccessPracticeMode,
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.gender = gender || user.gender;
    user.planType = planType || user.planType;

    if (isVerified !== undefined) {
      user.isVerified = isVerified;
    }

    if (canAccessPracticeMode !== undefined) {
      user.canAccessPracticeMode = canAccessPracticeMode;
    }

    if (role === "admin") {
      user.permissions = permissions || user.permissions;
    } else {
      user.permissions = [];
    }

    if (password && password.trim() !== "") {
      user.password = password;
    }

    const updatedUser = await user.save();

    const responseData = updatedUser.toObject();
    delete responseData.password;

    res.json(responseData);
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ error: "Failed to update user details." });
  }
};
