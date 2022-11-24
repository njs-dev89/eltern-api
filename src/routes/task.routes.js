import express from "express";
import {
  createTask,
  customizeTask,
  getTasks,
  markTaskIrrelevant,
  startTask,
  unmarkTaskIrrelevant,
} from "../controllers/task.controller.js";
import { isAdmin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, getTasks).post(protect, createTask);
router.route("/markIrrelevant/:taskId").patch(protect, markTaskIrrelevant);
router.route("/unmarkIrrelevant/:taskId").patch(protect, unmarkTaskIrrelevant);
router.route("/customize/:taskId").patch(protect, customizeTask);
router.route("/start/:taskId").patch(protect, startTask);

export default router;
