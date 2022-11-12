import express from "express";
import { createTopic } from "../controllers/topic.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").post(protect, createTopic);

export default router;
