import express from "express";
import {
  completeTask,
  createTask,
  customizeTask,
  getSingleTask,
  getTasks,
  imageUpload,
  markTaskIrrelevant,
  resizeImg,
  startTask,
  unmarkTaskIrrelevant,
} from "../controllers/task.controller.js";
import { isAdmin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getTasks)
  .post(protect, imageUpload, resizeImg, createTask);
router.route("/:id").get(protect, getSingleTask);
router.route("/markIrrelevant/:taskId").patch(protect, markTaskIrrelevant);
router.route("/unmarkIrrelevant/:taskId").patch(protect, unmarkTaskIrrelevant);
router
  .route("/customize/:id")
  .patch(protect, imageUpload, resizeImg, customizeTask);
router.route("/start/:taskId").patch(protect, startTask);
router.route("/complete/:taskId").patch(protect, completeTask);

export default router;
