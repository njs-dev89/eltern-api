import { model, Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["feed", "task"],
    },
    time: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);

export default Notification;
