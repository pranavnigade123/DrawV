// lib/models/Registration.ts
import mongoose, { Schema, models, model, Document, Model } from "mongoose";

export type RegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ITeamMember {
  name: string;
  email: string;
  ign: string;
}

export interface IRegistration extends Document {
  _id: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  tournamentSlug: string;
  entryType: "team" | "solo";
  team?: {
    name: string;
    leader: {
      userId: mongoose.Types.ObjectId;
      name: string | null;
      email: string;
      ign: string;
      phone?: string | null;
    };
    members: ITeamMember[];
    size: number;
  };
  solo?: {
    userId: mongoose.Types.ObjectId;
    name: string | null;
    email: string;
    ign: string;
    phone?: string | null;
  };
  status: RegistrationStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Team member schema
const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    ign: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// Main registration schema
const RegistrationSchema = new Schema<IRegistration>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    tournamentSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    entryType: {
      type: String,
      enum: ["team", "solo"],
      required: true,
    },

    team: {
      name: { type: String, trim: true },
      leader: {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        name: { type: String, default: null },
        email: { type: String, lowercase: true, trim: true },
        ign: { type: String, trim: true },
        phone: { type: String, default: null },
      },
      members: { type: [TeamMemberSchema], default: [] },
      size: { type: Number, min: 2 },
    },

    solo: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String, default: null },
      email: { type: String, lowercase: true, trim: true },
      ign: { type: String, trim: true },
      phone: { type: String, default: null },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      required: true,
      default: "approved", // changed from "pending"
      index: true,
    },

    notes: { type: String, default: null },
  },
  { timestamps: true }
);

// Smart validation
RegistrationSchema.pre("validate", function (next) {
  if (this.entryType === "team") {
    if (!this.team?.leader?.userId || !this.team?.name || !this.team?.size) {
      return next(new Error("Invalid team registration payload"));
    }
    this.solo = undefined as any;
  } else if (this.entryType === "solo") {
    if (!this.solo?.userId || !this.solo?.ign || !this.solo?.email) {
      return next(new Error("Invalid solo registration payload"));
    }
    this.team = undefined as any;
  }
  next();
});

// Unique constraints
RegistrationSchema.index(
  { tournamentId: 1, "team.leader.userId": 1, status: 1 },
  {
    name: "uniq_active_team_leader",
    partialFilterExpression: {
      status: { $in: ["pending", "approved"] },
    },
  }
);
RegistrationSchema.index(
  { tournamentId: 1, "solo.userId": 1, status: 1 },
  {
    name: "uniq_active_solo_user",
    partialFilterExpression: {
      status: { $in: ["pending", "approved"] },
    },
  }
);

RegistrationSchema.index({ tournamentId: 1, status: 1, createdAt: -1 });

RegistrationSchema.virtual("displayName").get(function (this: IRegistration) {
  if (this.entryType === "team") {
    return this.team?.name || this.team?.leader?.name || "Unknown Team";
  } else {
    return this.solo?.name || "Unknown Player";
  }
});

const Registration: Model<IRegistration> =
  models.Registration || model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
