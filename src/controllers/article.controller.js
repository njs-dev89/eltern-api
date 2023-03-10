import asyncHandler from "express-async-handler";
import multer from "multer";
import Jimp from "jimp";
import Article from "../models/article.model.js";
import Period from "../models/period.model.js";
import Topic from "../models/topic.model.js";
import { Types } from "mongoose";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 3,
  },
  fileFilter: (req, file, next) => {
    if (file.mimetype.startsWith("image/")) {
      next(null, true);
    } else {
      next(null, false);
    }
  },
}).single("img");

const resizeImg = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const extension = req.file.mimetype.split("/")[1];
  req.body.imgLink = `/uploads/articles/${
    req.body.title
  }-${Date.now()}.${extension}`;
  const image = await Jimp.read(req.file.buffer);
  await image.resize(250, Jimp.AUTO);
  await image.write(`./src/static/${req.body.imgLink}`);
  next();
});

const createArticle = asyncHandler(async (req, res) => {
  const periods = await Period.find({
    $or: [
      { start: { $lte: req.body.start }, end: { $gte: req.body.start } },
      { start: { $lte: req.body.end }, end: { $gte: req.body.end } },
      { start: { $gte: req.body.start }, end: { $lte: req.body.end } },
    ],
  });
  if (!periods) {
    res.status(400);
    throw new Error("No period found around the provided start and end time");
  }
  req.body.periods = periods.map((period) => period._id);

  const article = await Article.create(req.body);
  if (!article) {
    res.status(400);
    throw new Error("Invalid article data");
  }
  res.status(201).json({ success: true, data: article, message: null });
});

const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const periods = await Period.find({
    $or: [
      { start: { $lte: req.body.start }, end: { $gte: req.body.start } },
      { start: { $lte: req.body.end }, end: { $gte: req.body.end } },
      { start: { $gte: req.body.start }, end: { $lte: req.body.end } },
    ],
  });
  if (!periods) {
    res.status(400);
    throw new Error("No period found around the provided start and end time");
  }
  req.body.periods = periods.map((period) => period._id);

  const article = await Article.findByIdAndUpdate(id, req.body, {
    overwrite: false,
    new: true,
    runValidators: true,
  });
  if (!article) {
    res.status(404);
    throw new Error("Article not found");
  }
  res.status(201).json({ success: true, data: article, message: null });
});

const deleteArticle = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const article = await Article.findByIdAndDelete(id);
  if (!article) {
    res.status(404);
    throw new Error("Article not found");
  }
  res.json({
    success: true,
    data: { message: `Article of id ${id} deleted successfully` },
    message: null,
  });
});

const markArticleIrrelevant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    {
      $addToSet: { irrelevantUsers: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedArticle });
});

const unmarkArticleIrrelevant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    {
      $pull: { irrelevantUsers: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedArticle });
});

const markArticleRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    {
      $addToSet: { usersRead: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedArticle });
});

const markArticleFavourite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    {
      $addToSet: { usersLiked: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedArticle });
});

const unmarkArticleFavourite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    {
      $pull: { usersLiked: req.user._id },
    },
    { new: true }
  );
  res.json({ success: true, message: null, data: updatedArticle });
});

const getFeed = asyncHandler(async (req, res) => {
  const { skip, limit } = req.query;
  console.log(req.user._id);
  const topics = await Topic.find({
    irrelevantUsers: { $elemMatch: { $eq: req.user._id.toString() } },
  });
  const irrelevantTopics = topics.map((topic) => topic._id);

  const filter = {
    topic: { $nin: irrelevantTopics },
    irrelevantUsers: { $not: { $elemMatch: { $eq: req.user._id } } },
    usersRead: { $not: { $elemMatch: { $eq: req.user._id } } },
  };
  const feed = await Article.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "articles",
        as: "relatedTasks",
      },
    },
    { $sort: { start: 1 } },
  ])
    .skip(Number(skip))
    .limit(Number(limit));

  res.json({ success: true, data: feed, message: null });
});

const getSingleArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const article = await Article.findById(id)
    .populate({ path: "reviews.user", select: "username avatar" })
    .populate("relatedTasks")
    .populate("relatedArticles");
  // const article = await Article.aggregate([
  //   { $match: { _id: { $eq: Types.ObjectId(id) } } },
  //   {
  //     $lookup: {
  //       from: "tasks",
  //       localField: "_id",
  //       foreignField: "articles",
  //       as: "relatedTasks",
  //     },
  //   },
  // ]);
  res.json({ success: true, data: article, message: null });
});

const getTopicArticles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit, skip } = req.query;

  const articles = await Article.find({ topic: id })
    .skip(Number(skip))
    .limit(Number(limit));
  res.json({ success: true, data: articles, message: null });
});

const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error("Article not found");
  }
  const alreadyReviewed = article.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Article already reviewed");
  }

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment,
  };

  article.reviews.push(review);
  article.numReviews = article.reviews.length;
  article.rating =
    article.reviews.reduce((acc, item) => {
      return item.rating + acc;
    }, 0) / article.reviews.length;
  console.log(article.reviews);
  await article.save();

  res.json({ success: true, message: null, data: article });
});

export {
  createArticle,
  updateArticle,
  imageUpload,
  resizeImg,
  deleteArticle,
  getFeed,
  getSingleArticle,
  markArticleIrrelevant,
  unmarkArticleIrrelevant,
  markArticleRead,
  markArticleFavourite,
  unmarkArticleFavourite,
  getTopicArticles,
  createReview,
};
