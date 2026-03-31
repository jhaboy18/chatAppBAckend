import mongoose from "mongoose";

const shonaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  profilePic: {
    type: String,
    default: ""
  },

  bio: {
    type: String,
    default: ""
  },

  isOnline: {
    type: Boolean,
    default: false
  },

  lastSeen: {
    type: Date,
    default: null
  }

}, { timestamps: true });

export const Shona = mongoose.model("Shona", shonaSchema);