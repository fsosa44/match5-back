const Conversation = require("../models/Conversation");
const PrivateMessage = require("../models/PrivateMessage");

// GET /api/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name position")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// POST /api/conversations
// Body: { participantId }
const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ message: "participantId es requerido" });
    }

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: "No podés crear una conversación con vos mismo" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 },
    }).populate("participants", "name position");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
      });
      await conversation.populate("participants", "name position");
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// GET /api/conversations/:conversationId/messages
const getPrivateMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversación no encontrada" });
    }

    // Verify user is participant
    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const messages = await PrivateMessage.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = { getConversations, getOrCreateConversation, getPrivateMessages };
