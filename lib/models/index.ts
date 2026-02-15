// lib/models/index.ts
import mongoose from "mongoose";
import Tournament from "./Tournament";
import Registration from "./Registration";
import User from "./User";
import Notification from "./Notification";

// ✅ Ensure all schemas are registered with mongoose once
export const registerModels = () => {
  // Access them so Mongoose registers them globally
  if (!mongoose.models.Tournament) mongoose.model("Tournament", Tournament.schema);
  if (!mongoose.models.Registration) mongoose.model("Registration", Registration.schema);
  if (!mongoose.models.User) mongoose.model("User", User.schema);
  if (!mongoose.models.Notification) mongoose.model("Notification", Notification.schema);
};
