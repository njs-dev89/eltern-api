import { model, Schema } from "mongoose";

const topicSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: "Topic",
  },
});

const Topic = model("Topic", topicSchema);

export default Topic;
