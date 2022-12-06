import asyncHandler from "express-async-handler";
import multer from "multer";
import Jimp from "jimp";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = (await User.create({ username, password })).toObject();

  if (user) {
    delete user.password;

    res.status(201).json({
      success: true,
      data: { user, token: generateToken(user._id) },
      message: null,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  let user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    user = user.toObject();
    delete user.password;
    res.json({
      success: true,
      data: { user, token: generateToken(user._id) },
      message: null,
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

const getUserProfile = (req, res) => {
  res.json({ success: true, data: req.user, message: null });
};

const uploadAvatar = multer({
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
}).single("avatar");

const resizeAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const extension = req.file.mimetype.split("/")[1];
  req.body.avatar = `/uploads/avatars/${
    req.user.username
  }-${Date.now()}.${extension}`;
  const image = await Jimp.read(req.file.buffer);
  await image.resize(250, Jimp.AUTO);
  await image.write(`./src/static/${req.body.avatar}`);
  next();
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (req.body.avatar && user.avatar !== "/images/profile-image.jpg") {
    fs.unlink(path.join(__dirname, "../static", user.avatar), (err) => {
      console.log(err);
    });
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, req.body, {
    overwrite: false,
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({ success: true, message: null, data: updatedUser });
});

const deleteProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user._id);
  res.json({
    success: true,
    data: { message: `${user.username} deleted successfully` },
    message: null,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  console.log("Route called");
  const users = await User.find({}).select("-password");
  if (users.length === 0) {
    console.log("No users found");
    return res.json({
      success: true,
      data: [{ username: "unknown" }],
      message: null,
    });
  }
  res.json({ success: true, data: users, message: null });
});
export {
  registerUser,
  authUser,
  getUserProfile,
  deleteProfile,
  getAllUsers,
  uploadAvatar,
  resizeAvatar,
  updateUserProfile,
};
