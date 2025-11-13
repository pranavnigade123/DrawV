// lib/models/Schedule.ts
import mongoose, { Schema, models, model, Document } from "mongoose";

export interface ISchedule extends Document {
  _id: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  bracketId: string;
  title: string; // e.g., "Round 1 Schedule", "Semi-Finals Schedule"
  description?: string;
  matches: Array<{
    matchId: string;
    opponentA: string;
    opponentB: string;
    scheduledAt: Date;
    scheduledEndAt?: Date;
    venue?: string;
    streamUrl?: string;
    round: number;
    bracket: string;
  }>;
  publishedAt: Date;
  publishedBy: mongoose.Types.ObjectId;
  isActive: boolean; // Current schedule or archived
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    bracketId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    matches: [
      {
        matchId: { type: String, required: true },
        opponentA: { type: String, required: true },
        opponentB: { type: String, required: true },
        scheduledAt: { type: Date, required: true },
        scheduledEndAt: { type: Date, default: null },
        venue: { type: String, default: null },
        streamUrl: { type: String, default: null },
        round: { type: Number, required: true },
        bracket: { type: String, required: true },
      },
    ],
    publishedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
ScheduleSchema.index({ tournamentId: 1, publishedAt: -1 });
ScheduleSchema.index({ bracketId: 1, isActive: 1 });

const Schedule =
  models.Schedule || model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;
