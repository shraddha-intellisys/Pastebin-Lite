import { kv } from "@vercel/kv";

export type PasteRecord = {
  id: string;
  content: string;
  createdAtMs: number;
  expiresAtMs: number | null;
  remainingViews: number | null;
};

// in-memory fallback for local dev
const mem = new Map<string, PasteRecord>();
const key = (id: string) => `paste:${id}`;

function kvReady() {
  return (
    !!process.env.KV_REST_API_URL &&
    !!process.env.KV_REST_API_TOKEN
  );
}

export async function savePaste(p: PasteRecord) {
  if (kvReady()) {
    await kv.set(key(p.id), p);
  } else {
    mem.set(key(p.id), p);
  }
}

export async function getPaste(id: string): Promise<PasteRecord | null> {
  if (kvReady()) {
    return (await kv.get<PasteRecord>(key(id))) ?? null;
  }
  return mem.get(key(id)) ?? null;
}

export async function deletePaste(id: string) {
  if (kvReady()) {
    await kv.del(key(id));
  } else {
    mem.delete(key(id));
  }
}