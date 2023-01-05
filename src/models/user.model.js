import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

// const nonRelevantTopicSchema = new Schema({
//   topicId: { type: Schema.Types.ObjectId, required: true },
//   nonRelevantSubTopics: [{ type: Schema.Types.ObjectId }],
// });

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "/images/profile-image.jpg",
    },
    expectedBirthDate: {
      type: Date,
    },
    relevantPeriod: [
      {
        type: Schema.Types.ObjectId,
        ref: "Period",
      },
    ],
    // nonRelevantTopics: nonRelevantTopicSchema,
    enableNotifications: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastActive: {
      type: Date,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

const User = model("User", userSchema);

export default User;
