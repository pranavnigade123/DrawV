// lib/models/Bracket.ts
import mongoose, { Schema } from "mongoose";

const OpponentSchema = new Schema(
  {
    type: { type: String, enum: ["team", "player", "placeholder"], required: true },
    refId: { type: String, default: null },
    label: { type: String, default: null },
    propagatedFrom: { type: String, default: null }, // helpful for rollback
  },
  { _id: false }
);

const MatchSchema = new Schema(
  {
    id: { type: String, required: true }, // R1M1 etc
    bracket: { type: String, enum: ["W", "L", "F"], required: true },
    round: { type: Number, required: true },
    matchNumber: { type: Number, required: true },
    opponentA: { type: OpponentSchema, default: () => ({ type: "placeholder", label: null }) },
    opponentB: { type: OpponentSchema, default: () => ({ type: "placeholder", label: null }) },
    scoreA: { type: Number, default: null },
    scoreB: { type: Number, default: null },
    winner: { type: String, enum: ["A", "B", null], default: null },
    finished: { type: Boolean, default: false },
    winnerto: { type: String, default: null },
    loserto: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} }, // e.g., slot mapping info
  },
  { _id: false }
);

const BracketSchema = new Schema(
  {
    bracketId: { type: String, required: true, unique: true },
    tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament", default: null },

    // ✅ Keep one consistent user field for ownership
    userId: { type: String, required: true },

    // Optional: ownerId for future linking to "User" model (not required)
    ownerId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    format: { type: String, enum: ["single_elim", "double_elim"], required: true },
    participantsCount: { type: Number, required: true },

    params: { type: Schema.Types.Mixed, default: {} },
    matches: { type: [MatchSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Bracket || mongoose.model("Bracket", BracketSchema);
