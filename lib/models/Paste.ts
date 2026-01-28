import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const PasteSchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    createdAtMs: { type: Number, required: true },
    expiresAtMs: { type: Number, default: null },
    maxViews: { type: Number, default: null },
    remainingViews: { type: Number, default: null },
  },
  { timestamps: false }
);

export type PasteDoc = InferSchemaType<typeof PasteSchema> & { _id: string };

export const Paste: Model<PasteDoc> =
  mongoose.models.Paste || mongoose.model<PasteDoc>("Paste", PasteSchema);