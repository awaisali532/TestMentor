const jwt = require("jsonwebtoken");
const User = require("../models/user");

// 1. Verify Token & User Status
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    let decoded;

    // Step A: Verify JWT Signature & Expiry
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res
        .status(401)
        .json({ message: "Not authorized, token failed or expired" });
    }

    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid Token payload" });
    }

    // Step B: Fetch user from Database (Protected from causing 401 on DB connection issue)
    try {
      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (req.user.isActive === false) {
        return res
          .status(403)
          .json({ message: "Your account has been banned." });
      }

      return next();
    } catch (dbError) {
      console.error("Database error in protect middleware:", dbError.message);
      return res.status(500).json({
        message: "Internal server error during authentication check",
      });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


// 2. Check if Role is Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// 3. ✅ NEW: Check Specific Permission
const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    // Logic: If user is SuperAdmin OR has the specific permission in array -> Allow
    if (
      req.user &&
      (req.user.isSuperAdmin ||
        (req.user.permissions &&
          req.user.permissions.includes(requiredPermission)))
    ) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Access Denied: Insufficient Permissions" });
    }
  };
};

module.exports = { protect, admin, hasPermission };
