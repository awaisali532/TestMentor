const jwt = require("jsonwebtoken");
const User = require("../models/user");

// 1. Verify Token & User Status
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded.id || decoded.userId || decoded._id;
      if (!userId) return res.status(401).json({ message: "Invalid Token" });

      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (req.user.isActive === false) {
        return res
          .status(403)
          .json({ message: "Your account has been banned." });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
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
