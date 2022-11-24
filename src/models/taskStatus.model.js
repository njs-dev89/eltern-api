import { model, Schema } from "mongoose";

const noteSchema = new Schema({
  text: String,
  imgLink: String,
});

const taskStatusSchema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  start: {
    type: Number,
    min: -280,
    max: 364,
  },
  end: {
    type: Number,
    min: -279,
    max: 365,
  },
  status: {
    type: String,
    enum: ["Open", "Started", "Completed"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  note: noteSchema,
});

const TaskStatus = model("TaskStatus", taskStatusSchema);

export default TaskStatus;
