import asyncHandler from "express-async-handler";
import Task from "../models/task.model.js";
import TaskStatus from "../models/taskStatus.model.js";

const createTask = asyncHandler(async (req, res) => {
  let noteText = req.body.noteText;
  let noteImg = req.body.noteImg;

  delete req.body.noteText;
  delete req.body.noteImg;
  if (!req.user.isAdmin) {
    req.body.isAdminTask = false;
    req.body.user = req.user._id;
    if (req.articles) {
      delete req.articles;
    }
  }
  const task = await Task.create(req.body);
  if (!task) {
    res.status(400);
    throw new Error("Invalid task data");
  }
  if (req.user.isAdmin) {
    return res.status(201).json({ success: true, data: task, message: null });
  }
  const taskStatusData = {
    taskId: task._id,
    // start: task.recommendedStart,
    // end: task.recommendedEnd,
    status: "Open",
    user: req.user._id,
  };
  if (noteText) {
    taskStatusData.note.text = noteText;
  }
  if (noteImg) {
    taskStatusData.note.imgLink = noteImg;
  }
  const taskStatus = await TaskStatus.create(taskStatusData);

  task.taskStatus = taskStatus;
  res.status(201).json({ success: true, data: task, message: null });
});

const startTask = asyncHandler(async (req, res) => {
  let taskStatus;
  const { id } = req.params;
  const { statusId } = req.query;

  const taskStatusData = {
    taskId: id,
    start: req.body.start,
    end: req.body.end,
    status: "Started",
  };
  if (req.body.noteText) {
    taskStatusData.note.text = req.body.noteText;
    delete req.body.noteText;
  }
  if (req.body.noteImg) {
    taskStatusData.note.imgLink = req.body.noteImg;
    delete req.body.noteImg;
  }
  if (statusId) {
    taskStatus = await TaskStatus.findByIdAndUpdate(statusId, taskStatusData);
  } else {
    taskStatus = await TaskStatus.create(taskStatusData);
  }

  res.json({ success: true, data: taskStatus, message: null });
});

const customizeTask = asyncHandler(async (req, res) => {
  let taskStatus;
  const { id } = req.params;
  const { statusId } = req.query;
  console.log(id);
  const taskStatusData = {
    taskId: id,
    // start: req.body.start,
    // end: req.body.end,
    status: req.body.status,
    user: req.user._id,
  };
  if (req.body.start && req.body.end) {
    taskStatusData.start = req.body.start;
    taskStatusData.end = req.body.end;
  }
  if (req.body.noteText) {
    taskStatusData.note.text = req.body.noteText;
    delete req.body.noteText;
  }
  if (req.body.noteImg) {
    taskStatusData.note.imgLink = req.body.noteImg;
    delete req.body.noteImg;
  }
  if (statusId) {
    taskStatus = await TaskStatus.findByIdAndUpdate(statusId, taskStatusData);
  } else {
    taskStatus = await TaskStatus.create(taskStatusData);
  }

  res.json({ success: true, data: taskStatus, message: null });
});

const completeTask = asyncHandler(async (req, res) => {
  const { statusId } = req.query;
  const taskStatus = await TaskStatus.findByIdAndUpdate(statusId, {
    status: "Completed",
  });
  res.json({ success: true, data: taskStatus, message: null });
});

const markTaskIrrelevant = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      $addToSet: { irrelevantUsers: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedTask });
});

const unmarkTaskIrrelevant = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      $pull: { irrelevantUsers: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedTask });
});

const getTasks = asyncHandler(async (req, res) => {
  let tasks;
  const { filter } = req.query;
  if (filter === "all") {
    tasks = await Task.find({ parent: { $eq: null } }).populate({
      path: "taskStatus",
      match: { user: { $eq: req.user._id } },
      options: { sort: { end: 1 } },
    });
  }
  if (filter === "Started" || filter === "Open" || filter === "Completed") {
    const filter = {
      parent: { $eq: null },
      irrelevantUsers: { $ne: { $elemMatch: { $eq: req.user._id } } },
    };
    tasks = await Task.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "taskStatuses",
          // localField: "_id",
          // foreignField: "taskId",
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$taskId", "$$taskId"] },
                    { $eq: ["$user", req.user._id] },
                  ],
                },
              },
            },
          ],
          as: "taskStatus",
        },
      },
      {
        $match: {
          "taskStatus.status": { $eq: filter },
        },
      },
      { $sort: { "taskStatus.end": 1 } },
    ]);
  }
  // if (filter === "notStarted") {
  // }
  // if (filter === "Completed") {
  // }
  if (filter === "irrelevant") {
    tasks = Task.find({
      parent: { $eq: null },
      irrelevantUser: { $elemMatch: { $eq: req.user._id } },
    }).populate({
      path: "taskStatus",
      match: { user: { $eq: req.user._id } },
      options: { sort: { end: 1 } },
    });
  }
  if (filter === "overdue") {
    const date = new Date();
    const days = (date - req.user.expectedBirthDate) / (1000 * 60 * 60 * 24);
    const filter = {
      parent: { $eq: null },
      irrelevantUsers: { $ne: { $elemMatch: { $eq: req.user._id } } },
    };
    tasks = await Task.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "taskStatuses",
          // localField: "_id",
          // foreignField: "taskId",
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$taskId", "$$taskId"] },
                    { $eq: ["$user", req.user._id] },
                  ],
                },
              },
            },
          ],
          as: "taskStatus",
        },
      },
      {
        $match: {
          "taskStatus.end": { $lte: days },
        },
      },
      { $sort: { "taskStatus.end": 1 } },
    ]);
  }
  res.json({ success: true, data: tasks, message: null });
});

const getSingleTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id)
    .populate("taskStatus")
    .populate("subTasks");
  if (!task) {
    res.status(404);
    throw new Error("No task found with id " + id);
  }
  res.json({ success: true, data: task, message: null });
});

export {
  createTask,
  getTasks,
  getSingleTask,
  startTask,
  customizeTask,
  completeTask,
  markTaskIrrelevant,
  unmarkTaskIrrelevant,
};
