const User = require("../models/user");

// 1. Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    // .select("-password") means "Don't send the password back to frontend"
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// 2. Add New User (Manual Create by Admin)
exports.addUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email already exists" });

    // The Model will handle password hashing automatically
    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true,
    });

    // Return user without password
    const userResponse = await User.findById(user._id).select("-password");

    res.status(201).json({ message: "User created", user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Update User Info
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

// 4. Delete User
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};

// 5. Toggle Status (Ban/Unban)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isActive = !user.isActive; // Flip the status (true -> false)
    await user.save();

    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ error: "Status update failed" });
  }
};
