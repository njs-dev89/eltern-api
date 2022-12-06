import express from "express";
import {
  createArticle,
  createReview,
  deleteArticle,
  getFeed,
  getSingleArticle,
  getTopicArticles,
  imageUpload,
  markArticleFavourite,
  markArticleIrrelevant,
  markArticleRead,
  resizeImg,
  unmarkArticleFavourite,
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
  .get(protect, getSingleArticle)
  .put(protect, imageUpload, resizeImg, updateArticle)
  .delete(protect, deleteArticle);
router.route("/topic/:id").get(protect, getTopicArticles);
router.route("/markIrrelevant/:id").patch(protect, markArticleIrrelevant);
router.route("/unmarkIrrelevant/:id").patch(protect, unmarkArticleIrrelevant);
router.route("/markRead/:id").patch(protect, markArticleRead);
router.route("/markFavourite/:id").patch(protect, markArticleFavourite);
router.route("/unmarkFavourite/:id").patch(protect, unmarkArticleFavourite);
router.route("/addReview/:id").post(protect, createReview);

export default router;
