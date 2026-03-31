import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("Received file:", req.file?.originalname, "size:", req.file?.size);

    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "chat_files" },
        (err, uploadResult) => (err ? reject(err) : resolve(uploadResult))
      );
      stream.end(req.file.buffer);
    });

    console.log("Cloudinary URL:", result.secure_url);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.log("Upload error:", err.message);
    res.status(500).json({ msg: err.message });
  }
});

export default router;