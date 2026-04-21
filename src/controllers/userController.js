const User = require("../models/User");
const fs = require("fs");
const path = require("path");

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
      .select("name lastName position playStyle")
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("reviews.author", "name lastName profilePhoto");
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
    const allowedFields = ["name", "lastName", "phone", "position", "playStyle", "location"];
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

// POST /api/users/me/photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se envió ninguna imagen" });
    }

    const user = await User.findById(req.user._id);

    // Delete old photo if exists
    if (user.profilePhoto) {
      const oldPath = path.join(__dirname, "../../uploads", path.basename(user.profilePhoto));
      fs.unlink(oldPath, () => {});
    }

    user.profilePhoto = `/uploads/${req.file.filename}`;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al subir la foto" });
  }
};

module.exports = { getUserById, updateProfile, searchUsers, uploadPhoto };
