const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const setupSocket = require("./socket");

// Rutas
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const matchRoutes = require("./routes/matches");
const chatRoutes = require("./routes/chat");
const ratingRoutes = require("./routes/ratings");
const conversationRoutes = require("./routes/conversations");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/conversations", conversationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Setup Socket.IO
setupSocket(io);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});
