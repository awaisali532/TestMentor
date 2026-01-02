const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    // ✅ NEW: Regex Logic (Sab se Accurate)
    // Ye URL me se "upload/" dhoondta hai, uske baad version (v123..) ignore karta hai
    // Aur baaki ka path + filename utha leta hai (bina extension ke)
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = fileUrl.match(regex);

    if (!match || !match[1]) {
      console.log("⚠️ Could not extract Public ID from URL:", fileUrl);
      return;
    }

    const publicId = match[1]; // e.g., "avatars/user123"
    console.log(`🗑️ Deleting from Cloudinary. ID: ${publicId}`);

    // ✅ Delete Call
    // resource_type 'image' default hai, pdf ke liye 'raw' use karna padta hai
    const resourceType = fileUrl.includes(".pdf") ? "raw" : "image";

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log("✅ Cloudinary Response:", result);
  } catch (error) {
    console.error("❌ Cloudinary Delete Error:", error.message);
  }
};

module.exports = deleteFromCloudinary;
