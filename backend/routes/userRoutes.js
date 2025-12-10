const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require("../controllers/userController");

// Import Middleware to protect routes (Only Admin can access)
const { protect, admin } = require("../middleware/authMiddleware");

// Apply protection to all routes below
router.use(protect);
router.use(admin);

// Define Routes
router.get("/all", getAllUsers);
router.post("/add", addUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/status/:id", toggleUserStatus);

module.exports = router;
