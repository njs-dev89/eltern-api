import asyncHandler from "express-async-handler";
import multer from "multer";
import Jimp from "jimp";
import Topic from "../models/topic.model.js";
import { Types } from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
  next();
});

const createTopic = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const topicExists = await Topic.findOne({ name });

  if (topicExists) {
    res.status(400);
    throw new Error("Topic already exists");
  }
  const topic = await Topic.create(req.body);

  if (topic) {
    res.status(201).json({
      success: true,
      data: topic,
      message: null,
    });
  } else {
    res.status(400);
    throw new Error("Invalid topic data");
  }
});

const updateTopic = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (req.body.img) {
    const topic = await Topic.findById(id);
    if (topic.imgLink) {
      fs.unlink(path.join(__dirname, "../static", topic.imgLink), (err) =>
        console.log(err)
      );
    }
  }

  const updatedTopic = await Topic.findByIdAndUpdate(id, req.body, {
    overwrite: false,
    new: true,
    runValidators: true,
  });

  res.json({ success: true, message: null, data: updatedTopic });
});

const deleteTopic = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const topic = await Topic.findByIdAndDelete(id);
  if (!topic) {
    res.status(404);
    throw new Error("Topic not found");
  }
  res.json({
    success: true,
    data: { message: `Topic of id ${id} deleted successfully` },
    message: null,
  });
});

const markTopicIrrelevant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedTopic = await Topic.findByIdAndUpdate(
    id,
    {
      $addToSet: { irrelevantUsers: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedTopic });
});

const unmarkTopicIrrelevant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedTopic = await Topic.findByIdAndUpdate(
    id,
    {
      $pull: { irrelevantUsers: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedTopic });
});

const getTopics = asyncHandler(async (req, res) => {
  const { limit, skip, periodId } = req.query;
  console.log(req.user._id);
  const filter = {
    parent: { $eq: null },
    // period: { $elemMatch: { $eq: Types.ObjectId(periodId) } },
    irrelevantUsers: { $ne: { $elemMatch: { $eq: req.user._id } } },
  };
  if (periodId) {
    filter.period = { $elemMatch: { $eq: Types.ObjectId(periodId) } };
  }
  //   const topics = await Topic.find({});
  const topics = await Topic.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "topics",
        localField: "_id",
        foreignField: "parent",
        as: "subTopics",
      },
    },
  ])
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip(Number(skip))
    .exec();
  if (topics.length === 0) {
    res.status(404);
    throw new Error("No topics yet");
  }

  res.json({ success: true, data: topics, message: null });
});

export {
  uploadImg,
  resizeImg,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopics,
  markTopicIrrelevant,
  unmarkTopicIrrelevant,
};
