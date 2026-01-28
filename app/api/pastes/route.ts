import { NextResponse } from "next/server";
import crypto from "crypto";
import { createPaste, PasteRecord } from "../../../lib/store";

function isPosInt(n: any) {
  return Number.isInteger(n) && n >= 1;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.content !== "string" || body.content.trim() === "") {
    return NextResponse.json({ error: "content must be non-empty" }, { status: 400 });
  }

  if (body.ttl_seconds !== undefined && !isPosInt(body.ttl_seconds)) {
    return NextResponse.json({ error: "ttl_seconds must be >=1" }, { status: 400 });
  }

  if (body.max_views !== undefined && !isPosInt(body.max_views)) {
    return NextResponse.json({ error: "max_views must be >=1" }, { status: 400 });
  }

  const id = crypto.randomBytes(8).toString("hex");
  const now = Date.now();

  const rec: PasteRecord = {
    id,
    content: body.content,
    createdAtMs: now,
    expiresAtMs: body.ttl_seconds ? now + body.ttl_seconds * 1000 : null,
    maxViews: body.max_views ?? null,
    remainingViews: body.max_views ?? null,
  };

  await createPaste(rec);

  const origin = new URL(req.url).origin;
  return NextResponse.json({ id, url: `${origin}/p/${id}` }, { status: 201 });
}