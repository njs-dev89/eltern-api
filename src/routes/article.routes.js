import express from "express";
import {
  createArticle,
  deleteArticle,
  getFeed,
  imageUpload,
  markArticleIrrelevant,
  markArticleRead,
  resizeImg,
  unmarkArticleIrrelevant,
  updateArticle,
} from "../controllers/article.controller.js";
import { isAdmin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getFeed)
  .post(protect, imageUpload, resizeImg, createArticle);
router
  .route("/:id")
  .put(protect, imageUpload, resizeImg, updateArticle)
  .delete(protect, deleteArticle);
router.route("/markIrrelevant/:id").patch(protect, markArticleIrrelevant);
router.route("/unmarkIrrelevant/:id").patch(protect, unmarkArticleIrrelevant);
router.route("/markRead/:id").patch(protect, markArticleRead);

export default router;
