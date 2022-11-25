import Message from "../models/message.model.js";
import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadImg = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 3,
  },
  fileFilter: (req, file, next) => {
    if (file.mimetype.startsWith("image/")) {
      next(null, true);
    } else {
      next(null, false);
    }
  },
}).single("img");

const resizeImg = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const extension = req.file.mimetype.split("/")[1];
  req.body.imgLink = `/uploads/topics/${
    req.body.name
  }-${Date.now()}.${extension}`;
  const image = await Jimp.read(req.file.buffer);
  await image.resize(250, Jimp.AUTO);
  await image.write(`./src/static/${req.body.imgLink}`);
  res.json({ success: true, data: req.body.imgLink, message: null });
});

const deleteImg = asyncHandler(async (req, res) => {
  fs.unlink(path.join(__dirname, "../static", req.body.imgLink), (err) =>
    console.log(err)
  );

  res.json({
    success: true,
    data: "Image deleted successfully",
    message: null,
  });
});

const getRoomMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit, skip } = req.query;
  const messages = await Message.find({ roomId: id })
    .populate("postedBy", "username avatar")
    .sort({ timeSent: -1 })
    .limit(limit)
    .skip(skip);
  if (messages.length === 0) {
    res.status(404);
    throw new Error("No messages found");
  }
  res.json({ success: true, data: messages, message: null });
});

export { getRoomMessages, uploadImg, resizeImg, deleteImg };
