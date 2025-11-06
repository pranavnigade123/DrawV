// lib/models/User.ts
import mongoose, { Schema, models, model, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  provider?: string;
  role: "admin" | "player" | "guest";
  phone?: string;
  ign?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  provider: { type: String },
  role: {
    type: String,
    enum: ["admin", "player", "guest"],
    default: "player",
  },
  phone: { type: String, default: "" }, // newly added
  ign: { type: String, default: "" },   // newly added
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
export default User;
