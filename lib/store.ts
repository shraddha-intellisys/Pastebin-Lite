// lib/store.ts
import fs from "fs/promises";
import path from "path";

export type PasteRecord = {
  id: string;
  content: string;
  createdAtMs: number;
  expiresAtMs: number | null;
  maxViews: number | null;
  remainingViews: number | null;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "pastes.json");

async function readAll(): Promise<Record<string, PasteRecord>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, PasteRecord>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function persistenceHealth(): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export async function createPaste(rec: PasteRecord) {
  const data = await readAll();
  data[rec.id] = rec;
  await writeAll(data);
}

export async function getPaste(id: string): Promise<PasteRecord | null> {
  const data = await readAll();
  return data[id] ?? null;
}

export async function deletePaste(id: string) {
  const data = await readAll();
  delete data[id];
  await writeAll(data);
}

export async function consumeView(id: string): Promise<number | null> {
  const data = await readAll();
  const p = data[id];
  if (!p) return null;

  // unlimited
  if (p.remainingViews === null) return null;

  // already exhausted => unavailable
  if (p.remainingViews <= 0) {
    delete data[id];
    await writeAll(data);
    return null;
  }

  // decrement
  p.remainingViews -= 1;

  // if went negative (shouldn’t), delete and mark unavailable
  if (p.remainingViews < 0) {
    delete data[id];
    await writeAll(data);
    return null;
  }

  data[id] = p;
  await writeAll(data);
  return p.remainingViews;
}