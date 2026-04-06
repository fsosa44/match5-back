const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const PrivateMessage = require("./models/PrivateMessage");
const Conversation = require("./models/Conversation");
const User = require("./models/User");

const setupSocket = (io) => {
  // Auth middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("No autorizado"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Usuario conectado: ${socket.userId}`);

    // Join a match chat room
    socket.on("join:match", (matchId) => {
      socket.join(`match:${matchId}`);
      console.log(`Usuario ${socket.userId} se unió al chat del partido ${matchId}`);
    });

    // Leave a match chat room
    socket.on("leave:match", (matchId) => {
      socket.leave(`match:${matchId}`);
    });

    // Send message to match chat
    socket.on("message:match", async ({ matchId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const message = await Message.create({
          match: matchId,
          sender: socket.userId,
          text: text.trim(),
        });

        await message.populate("sender", "name");

        io.to(`match:${matchId}`).emit("message:match", {
          _id: message._id,
          match: matchId,
          sender: { _id: message.sender._id, name: message.sender.name },
          text: message.text,
          createdAt: message.createdAt,
        });
      } catch (error) {
        console.error("Error enviando mensaje de partido:", error);
      }
    });

    // Join a private conversation room
    socket.on("join:conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave a private conversation room
    socket.on("leave:conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send private message
    socket.on("message:private", async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Verify sender is participant
        if (!conversation.participants.some((p) => p.toString() === socket.userId)) {
          return;
        }

        const message = await PrivateMessage.create({
          conversation: conversationId,
          sender: socket.userId,
          text: text.trim(),
        });

        // Update last message in conversation
        conversation.lastMessage = {
          text: text.trim(),
          sender: socket.userId,
          createdAt: message.createdAt,
        };
        await conversation.save();

        await message.populate("sender", "name");

        io.to(`conversation:${conversationId}`).emit("message:private", {
          _id: message._id,
          conversation: conversationId,
          sender: { _id: message.sender._id, name: message.sender.name },
          text: message.text,
          createdAt: message.createdAt,
        });
      } catch (error) {
        console.error("Error enviando mensaje privado:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${socket.userId}`);
    });
  });
};

module.exports = setupSocket;
