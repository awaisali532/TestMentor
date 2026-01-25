const User = require("../models/user");

const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next();
    }

    if (user.planType === "paid" && user.subscription?.validUntil) {
      const currentDate = new Date();
      const expiryDate = new Date(user.subscription.validUntil);

      // ✅ FIX: Expiry Date ka time Raat ke aakhri lamhay (End of Day) par set kar dein
      // Example: Agar 25 Jan hai, to ye ban jayega: 25 Jan, 23:59:59.999
      expiryDate.setHours(23, 59, 59, 999);

      // Ab comparison karein
      if (currentDate > expiryDate) {
        console.log(
          `⚠️ User ${user.email} subscription expired. Downgrading to Free.`,
        );

        // Downgrade Logic
        user.planType = "free";
        user.subscription.status = false;
        user.subscription.validUntil = null;

        await user.save();

        req.user.planType = "free";
      }
    }

    next();
  } catch (error) {
    console.error("Subscription Check Error:", error);
    next();
  }
};

module.exports = checkSubscription;
