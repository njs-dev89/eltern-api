import { model, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
  },
  {
    timestamps: true,
  }
);

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imgLink: { type: String },
    topic: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Topic",
    },
    start: {
      type: Number,
      required: true,
      min: -280,
      max: 364,
    },
    end: {
      type: Number,
      required: true,
      min: -279,
      max: 365,
    },
    periods: [{ type: Schema.Types.ObjectId, ref: "Period" }],
    usersLiked: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    usersRead: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    irrelevantUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    articles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
    published: {
      type: Boolean,
      required: true,
      default: false,
    },
    reviews: [{ type: reviewSchema }],
    numReviews: { type: Number },
    rating: { type: Number },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

articleSchema.virtual("relatedTasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "articles",
});

articleSchema.virtual("relatedArticles", {
  ref: "Article",
  localField: "articles",
  foreignField: "_id",
});

const Article = model("Article", articleSchema);

export default Article;
