import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "Shona", required: true },
  content: { type: String, default: "" },
  file: { type: String, default: "" }, // Cloudinary or local file URL
  createdAt: { type: Date, default: Date.now }
});

export const Message= mongoose.model("Message", messageSchema);