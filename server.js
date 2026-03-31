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


// ✅ Allowed origins (frontend + local)
const allowedOrigins = [
  "http://localhost:5173",
  "https://shonaaaa.netlify.app"
];


// ✅ Socket.io setup (FIXED)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});


// ✅ Socket.io JWT Auth middleware
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


// ✅ Socket.io connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.on("send_message", async (msg) => {
    try {
      const message = await Message.create({
        sender: socket.userId,
        content: msg.content || "",
        file: msg.file || ""
      });

      const populatedMessage = await message.populate("sender", "name profilePic");

      io.emit("receive_message", populatedMessage);
    } catch (err) {
      console.error("Socket message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});


// ✅ Middleware
app.use(express.json());

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"]
}));


// ✅ Routes
app.get("/", (req, res) => res.send("Shona API running 🚀"));
app.use('/api/shona', shonarouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chat", chatRouter); 


// ✅ MongoDB
shonadb();


// ✅ Server start
const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Shona server running on port ${port}`));