import express from "express";
import {
  authUser,
  getUserProfile,
  registerUser,
  resizeAvatar,
  updateUserProfile,
  uploadAvatar,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, uploadAvatar, resizeAvatar, updateUserProfile);

export default router;
