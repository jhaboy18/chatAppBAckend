import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { shonadb } from './shonaKamemory/db.shona.js';
import shonarouter from './shonaKaRastaa/shonaka1stRasta.routes.js';
import { Message } from './ShonaModel/chat.model.js'; 
import jwt from 'jsonwebtoken';
import uploadRouter from './shonaKaRastaa/upload.route.js';
import chatRouter from "./shonaKaRastaa/chat.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true }
});

// Socket.io JWT Auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Receive message from client
  socket.on("send_message", async (msg) => {
    try {
      // Save message in DB
      const message = await Message.create({
        sender: socket.userId,
        content: msg.content || "",
        file: msg.file || ""
      });

      // Populate sender info (name + profilePic)
      const populatedMessage = await message.populate("sender", "name profilePic");

      // Emit message to all clients
      io.emit("receive_message", populatedMessage);
    } catch (err) {
      console.error("Socket message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// REST routes
app.get("/", (req, res) => res.send("Shona API running 🚀"));
app.use('/api/shona', shonarouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chat", chatRouter); 

// MongoDB connection
shonadb();

// Start server
const port = 8000;
server.listen(port, () => console.log(`Shona server running on port ${port}`));