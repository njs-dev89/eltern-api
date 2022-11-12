import { model, Schema } from "mongoose";

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  topic: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Topic",
  },
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
  published: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Article = model("Article", articleSchema);

export default Article;
