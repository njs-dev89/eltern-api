import express from "express";
import {
  createTopic,
  uploadImg,
  resizeImg,
  getTopics,
  deleteTopic,
  markTopicIrrelevant,
  unmarkTopicIrrelevant,
  updateTopic,
} from "../controllers/topic.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getTopics)
  .post(protect, uploadImg, resizeImg, createTopic);

router
  .route("/:id")
  .put(protect, uploadImg, resizeImg, updateTopic)
  .delete(protect, deleteTopic);
router.route("/markIrrelevant/:id").patch(protect, markTopicIrrelevant);
router.route("/unmarkIrrelevant/:id").patch(protect, unmarkTopicIrrelevant);

export default router;
