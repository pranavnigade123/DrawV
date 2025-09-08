// lib/models/PlaymaxCampusLeague.ts
import mongoose, { Schema, models, model, Document, Model } from "mongoose";

export interface IPlaymaxRegistration extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  dob: Date | null;
  course: string | null;
  gender: string | null;
  year: string | null;
  game: string | null;
  acceptTc: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaymaxRegistrationSchema = new Schema<IPlaymaxRegistration>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    dob: { type: Date, default: null },
    course: { type: String, default: null, trim: true },
    gender: { type: String, default: null, trim: true },
    year: { type: String, default: null, trim: true },
    game: { type: String, default: null, trim: true },
    acceptTc: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    collection: "playmaxcampusleague",
  }
);

PlaymaxRegistrationSchema.index({ email: 1, createdAt: -1 });

const PlaymaxRegistration: Model<IPlaymaxRegistration> =
  models.PlaymaxRegistration ||
  model<IPlaymaxRegistration>("PlaymaxRegistration", PlaymaxRegistrationSchema);

export default PlaymaxRegistration;
