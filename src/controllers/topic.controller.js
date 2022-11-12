import asyncHandler from "express-async-handler";
import Topic from "../models/topic.model.js";

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

export { createTopic };
