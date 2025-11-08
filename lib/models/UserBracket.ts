import mongoose, { Schema, model, models } from "mongoose";

const UserBracketSchema = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    name: { type: String, required: true },
    bracket: { type: Schema.Types.Mixed, required: true },
    format: { type: String, default: "single" },
  },
  { timestamps: true }
);

const UserBracket = models.UserBracket || model("UserBracket", UserBracketSchema);
export default UserBracket;
