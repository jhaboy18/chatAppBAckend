import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import shonarouter from "./shonaKaRastaa/shonaka1stRasta.routes.js";
import uploadRouter from "./shonaKaRastaa/upload.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://shonaaaa.netlify.app",
];

app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// 🔥 TEMP CHAT STORAGE
let messages = [];
const MESSAGE_LIFETIME = 1 * 60 * 1000;

// 🔐 JWT AUTH
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Auth error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Auth error"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.on("join", (userData) => {
    socket.user = {
      id: socket.userId,
      name: userData.name,
      profilePic: userData.profilePic,
    };

    const validMessages = messages.filter(
      (msg) => Date.now() - msg.createdAt < MESSAGE_LIFETIME
    );

    socket.emit("load_messages", validMessages);
  });

  socket.on("send_message", (msg) => {
    const message = {
      id: Date.now(),
      sender: {
        id: socket.userId,
        name: msg.name,
        profilePic: msg.profilePic,
      },
      content: msg.content || "",
      file: msg.file || "",
      createdAt: Date.now(),
    };

    messages.push(message);

    io.emit("receive_message", message);

    // ⏳ AUTO DELETE
    setTimeout(() => {
      messages = messages.filter((m) => m.id !== message.id);
      io.emit("delete_message", message.id);
    }, MESSAGE_LIFETIME);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);

    const userMsgs = messages.filter(
      (msg) => msg.sender.id === socket.userId
    );

    messages = messages.filter(
      (msg) => msg.sender.id !== socket.userId
    );

    userMsgs.forEach((msg) => {
      io.emit("delete_message", msg.id);
    });
  });
});

// ✅ routes (login/signup same)
app.use("/api/shona", shonarouter);
app.use("/api/upload", uploadRouter);

app.get("/", (req, res) => res.send("Server running 🚀"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));