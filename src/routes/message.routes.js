import express from "express";
import { getRoomMessages } from "../controllers/message.controller.js";
import { isAdmin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/:id").get(protect, getRoomMessages);

export default router;
