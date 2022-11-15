import asyncHandler from "express-async-handler";
import Period from "../models/period.model.js";

const createPeriod = asyncHandler(async (req, res) => {
  const { name, start, end } = req.body;
  if (Number(start) > Number(end)) {
    res.status(400);
    throw new Error("Invalid period data");
  }
  const periodExists = await Period.findOne({
    $or: [
      { name },
      { start: { $lte: req.body.start }, end: { $gte: req.body.start } },
      { start: { $lte: req.body.end }, end: { $gte: req.body.end } },
      { start: { $gte: req.body.start }, end: { $lte: req.body.end } },
    ],
  });

  if (periodExists) {
    res.status(400);
    throw new Error("Period already exists");
  }
  const period = await Period.create(req.body);

  if (period) {
    res.status(201).json({
      success: true,
      data: period,
      message: null,
    });
  } else {
    res.status(400);
    throw new Error("Invalid period data");
  }
});

const getPeriods = asyncHandler(async (req, res) => {
  const periods = await Period.find({});
  if (periods.length === 0) {
    res.status(404);
    throw new Error("No periods to show");
  }
  res.json({ success: true, message: null, data: periods });
});

const deletePeriod = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const period = await Period.findByIdAndDelete(id);
  if (!period) {
    res.status(404);
    throw new Error("Period not found");
  }
  res.json({
    success: true,
    data: { message: `Period ${period.name} deleted successfully` },
    message: null,
  });
});

export { createPeriod, getPeriods, deletePeriod };
