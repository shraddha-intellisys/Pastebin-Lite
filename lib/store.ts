import { dbConnect } from "./db";
import { Paste, type PasteDoc } from "./models/Paste";

export type PasteRecord = {
  id: string;
  content: string;
  createdAtMs: number;
  expiresAtMs: number | null;
  maxViews: number | null;
  remainingViews: number | null;
};

function toRecord(doc: PasteDoc): PasteRecord {
  return {
    id: doc._id.toString(),
    content: doc.content,
    createdAtMs: doc.createdAtMs,
    expiresAtMs: doc.expiresAtMs ?? null,
    maxViews: doc.maxViews ?? null,
    remainingViews: doc.remainingViews ?? null,
  };
}

export async function persistenceHealth(): Promise<boolean> {
  try {
    await dbConnect();
    return true;
  } catch {
    return false;
  }
}

export async function createPaste(input: Omit<PasteRecord, "id">): Promise<PasteRecord> {
  await dbConnect();
  const doc = await Paste.create({
    content: input.content,
    createdAtMs: input.createdAtMs,
    expiresAtMs: input.expiresAtMs,
    maxViews: input.maxViews,
    remainingViews: input.remainingViews,
  });
  return toRecord(doc);
}

export async function getPaste(id: string): Promise<PasteRecord | null> {
  await dbConnect();
  const doc = await Paste.findById(id).lean<PasteDoc | null>();
  return doc ? toRecord(doc) : null;
}

export async function deletePaste(id: string): Promise<void> {
  await dbConnect();
  await Paste.findByIdAndDelete(id);
}

export async function consumeView(id: string): Promise<number | null> {
  await dbConnect();

  // If remainingViews is null => unlimited (don’t decrement)
  const doc = await Paste.findById(id);
  if (!doc) return null;

  if (doc.remainingViews === null || doc.remainingViews === undefined) return null;

  if (doc.remainingViews <= 0) {
    await Paste.findByIdAndDelete(id);
    return null;
  }

  doc.remainingViews -= 1;

  if (doc.remainingViews < 0) {
    await Paste.findByIdAndDelete(id);
    return null;
  }

  await doc.save();
  return doc.remainingViews;
}