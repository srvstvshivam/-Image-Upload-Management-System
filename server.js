import express from "express";
import path from "path";
import mongoose from "mongoose";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const app = express();

// Cloudinary Config (from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// MongoDB Connection (from .env)
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// Routes
app.get("/", (req, res) => {
  res.render("index.ejs", { url: null });
});

// Multer Storage Config
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

// Mongoose Schema for Uploaded Images
const imageSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imgUrl: String,
});
const File = mongoose.model("cloudinary_files", imageSchema);

// Upload Route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log("✅ Uploaded:", result);

    // Save file record in MongoDB
    await File.create({
      filename: req.file.filename,
      public_id: result.public_id,
      imgUrl: result.secure_url,
    });

    res.render("index.ejs", { url: result.secure_url });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.send("Something went wrong");
  }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
