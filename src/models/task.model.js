import { model, Schema } from "mongoose";

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: { type: String, required: true, enum: ["errand", "completion"] },
    description: { type: String },
    recommendedStart: {
      type: Number,
      required: true,
      min: -280,
      max: 364,
    },
    recommendedEnd: {
      type: Number,
      required: true,
      min: -279,
      max: 365,
    },
    parent: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Task",
    },
    articles: [
      {
        type: Schema.Types.ObjectId,
        default: null,
        ref: "Article",
      },
    ],

    irrelevantUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isAdminTask: {
      type: Boolean,
      default: true,
    },
    user: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.virtual("taskStatus", {
  ref: "TaskStatus",
  localField: "_id",
  foreignField: "taskId",
});

const Task = model("Task", taskSchema);

export default Task;
