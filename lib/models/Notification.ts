// lib/models/Notification.ts
import mongoose, { Schema, models, model, Document, Model } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "announcement";
  priority: "low" | "medium" | "high";
  isActive: boolean;
  createdBy: string; // admin user ID
  createdAt: Date;
  expiresAt?: Date;
  dismissible: boolean;
  link?: string; // optional link for users to click
}

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["info", "success", "warning", "error", "announcement"],
    default: "info",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  dismissible: { type: Boolean, default: true },
  link: { type: String },
});

const Notification: Model<INotification> =
  models.Notification || model<INotification>("Notification", NotificationSchema);

export default Notification;
