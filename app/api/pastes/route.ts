import { NextResponse } from "next/server";
import crypto from "crypto";
import { savePaste, PasteRecord } from "../../../lib/store";

function isPosInt(n: any) {
  return Number.isInteger(n) && n >= 1;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = body?.content;
  const ttl_seconds = body?.ttl_seconds;
  const max_views = body?.max_views;

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "content must be a non-empty string" }, { status: 400 });
  }

  if (ttl_seconds !== undefined && !isPosInt(ttl_seconds)) {
    return NextResponse.json({ error: "ttl_seconds must be an integer >= 1" }, { status: 400 });
  }

  if (max_views !== undefined && !isPosInt(max_views)) {
    return NextResponse.json({ error: "max_views must be an integer >= 1" }, { status: 400 });
  }

  const id = crypto.randomBytes(8).toString("hex");
  const now = Date.now();

  const expiresAtMs = ttl_seconds ? now + ttl_seconds * 1000 : null;
  const remainingViews = max_views ?? null;

  const record: PasteRecord = {
    id,
    content,
    createdAtMs: now,
    expiresAtMs,
    remainingViews,
  };

  await savePaste(record);

  const origin = new URL(req.url).origin;
  return NextResponse.json(
    { id, url: `${origin}/p/${id}` },
    { status: 201 }
  );
}