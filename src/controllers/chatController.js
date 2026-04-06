const Message = require("../models/Message");
const Match = require("../models/Match");

// GET /api/chat/:matchId
const getMessages = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }

    const messages = await Message.find({ match: req.params.matchId })
      .populate("sender", "name profilePhoto")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// POST /api/chat/:matchId
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }

    const message = await Message.create({
      match: req.params.matchId,
      sender: req.user._id,
      text: text.trim(),
    });

    await message.populate("sender", "name profilePhoto");
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = { getMessages, sendMessage };
