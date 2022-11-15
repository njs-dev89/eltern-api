import { model, Schema } from "mongoose";

const topicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    parent: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Topic",
    },
    imgLink: String,
    period: [
      {
        type: Schema.Types.ObjectId,
        ref: "Period",
      },
    ],
    irrelevantUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Topic = model("Topic", topicSchema);

export default Topic;
