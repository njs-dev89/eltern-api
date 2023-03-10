import express from "express";
import {
  createPeriod,
  deletePeriod,
  getCurrentPeriod,
  getPeriods,
} from "../controllers/period.controller.js";

import { isAdmin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, getPeriods).post(protect, createPeriod);
router.route("/getCurrentPeriod").get(protect, getCurrentPeriod);
router.route("/:id").delete(protect, deletePeriod);

export default router;
