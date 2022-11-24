import { model, Schema } from "mongoose";

const messageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    imgLink: {
      type: String,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timeSent: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = model("Chat", messageSchema);

export default Message;
