import express from "express";
import { shonaKoprotectkro } from "../shona_Authrization/shonaw.middleware.js"; 
import { Message } from "../ShonaModel/chat.model.js";

const router = express.Router();

// GET previous messages
router.get("/", shonaKoprotectkro, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 }); // oldest to newest
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;