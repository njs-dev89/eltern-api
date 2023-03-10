import express from "express";
import {
  authUser,
  deleteProfile,
  getAllUsers,
  getUserProfile,
  registerUser,
  resizeAvatar,
  setLastActive,
  toggleEnableNotification,
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
  .put(protect, uploadAvatar, resizeAvatar, updateUserProfile)
  .delete(protect, deleteProfile);

router.route("/setLastActive").patch(protect, setLastActive);
router
  .route("/toggleEnableNotifications")
  .patch(protect, toggleEnableNotification);

router.route("/users").get(getAllUsers);

export default router;
