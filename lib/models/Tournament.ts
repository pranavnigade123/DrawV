// lib/models/Tournament.ts
import mongoose, { Schema, model, models, Document, Model } from "mongoose";
import { toSlug } from "@/lib/slug";

export type TournamentStatus = "draft" | "open" | "ongoing" | "completed";

export interface ITournament extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  game?: string | null;
  format: "single_elim" | "double_elim" | "round_robin" | "groups_playoffs";
  entryType: "solo" | "team";
  registrationOpenAt?: Date | null;
  registrationCloseAt?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  maxParticipants?: number | null;
  coverImage?: string | null;
  rules?: string | null;
  description?: string | null;
  status: TournamentStatus;
  archivedAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },

    // Core fields
    game: { type: String, default: null },

    format: {
      type: String,
      enum: ["single_elim", "double_elim", "round_robin", "groups_playoffs"],
      required: true,
      default: "single_elim",
    },

    entryType: {
      type: String,
      enum: ["solo", "team"],
      required: true,
      default: "team",
    },

    // Dates
    registrationOpenAt: { type: Date, default: null },
    registrationCloseAt: { type: Date, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },

    // Optional details
    maxParticipants: { type: Number, default: null, min: 1 },
    coverImage: { type: String, default: null },
    rules: { type: String, default: null },
    description: { type: String, default: null },

    // Manual-only status
    status: {
      type: String,
      enum: ["draft", "open", "ongoing", "completed"],
      required: true,
      default: "draft",
      index: true,
    },

    archivedAt: { type: Date, default: null, index: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Generate slug if missing
TournamentSchema.pre("validate", function (next) {
  if (!this.name) return next();
  if (!this.slug || typeof this.slug !== "string" || !this.slug.trim()) {
    this.slug = toSlug(this.name);
  }
  next();
});

// No pre-save hooks: status is fully manual.

TournamentSchema.index({ archivedAt: 1, status: 1, createdAt: -1 });

const Tournament: Model<ITournament> =
  models.Tournament || model<ITournament>("Tournament", TournamentSchema);

export default Tournament;
