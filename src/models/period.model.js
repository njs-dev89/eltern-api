import { model, Schema } from "mongoose";

const periodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
    irrelevantUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Period = model("Period", periodSchema);

export default Period;
