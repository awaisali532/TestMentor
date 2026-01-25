const User = require("../models/user");

// Default Global Limit
const GLOBAL_FREE_LIMIT = 5;

// ==========================================
// 1. TRACK PAPER GENERATION (With Custom Limit)
// ==========================================
exports.trackPaperGeneration = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔒 CALCULATE LIMIT (Problem 2 Logic)
    // Agar user ka apna limit set hai (customPaperLimit), to wo use karo, warna Global Limit (5)
    const effectiveLimit =
      user.usage.customPaperLimit !== null
        ? user.usage.customPaperLimit
        : GLOBAL_FREE_LIMIT;

    // 1️⃣ CHECK LIMIT (Sirf Free users k liye)
    // Note: Agar user Premium hai to ye check skip ho jata hai
    if (
      user.planType === "free" &&
      user.usage.papersGenerated >= effectiveLimit
    ) {
      return res.status(403).json({
        success: false,
        error: "LIMIT_REACHED",
        message: `Limit reached! You have used ${user.usage.papersGenerated}/${effectiveLimit} papers.`,
      });
    }

    // 2️⃣ INCREMENT COUNT
    user.usage.papersGenerated += 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Count updated",
      remaining:
        user.planType === "free"
          ? effectiveLimit - user.usage.papersGenerated
          : "Unlimited",
    });
  } catch (error) {
    console.error("Usage Tracking Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==========================================
// 2. GET USAGE STATS (Dynamic Limit)
// ==========================================
exports.getUsageStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔒 Dynamic Limit Calculation
    let currentLimit = -1; // Unlimited for Premium

    if (user.planType === "free") {
      currentLimit =
        user.usage.customPaperLimit !== null
          ? user.usage.customPaperLimit
          : GLOBAL_FREE_LIMIT;
    }

    res.json({
      success: true,
      usage: user.usage.papersGenerated,
      limit: currentLimit, // Ab ye 5 bhi ho sakta hai ya 10 (agar admin ne change kia ho)
      plan: user.planType,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
