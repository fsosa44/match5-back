const User = require("../models/User");

// GET /api/users/search?q=name
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      name: { $regex: q.trim(), $options: "i" },
      _id: { $ne: req.user._id },
    })
      .select("name position playStyle")
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// PUT /api/users/me
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "position", "playStyle", "location"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = { getUserById, updateProfile, searchUsers };
