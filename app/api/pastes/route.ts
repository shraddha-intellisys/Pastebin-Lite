export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createPaste } from "../../../lib/store";

function isPosInt(n: any) {
  return Number.isInteger(n) && n >= 1;
}

export async function POST(req: Request) {
  try {
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

    const now = Date.now();
    const expiresAtMs = body.ttl_seconds ? now + body.ttl_seconds * 1000 : null;
    const maxViews = body.max_views ?? null;

    const rec = await createPaste({
      content: body.content,
      createdAtMs: now,
      expiresAtMs,
      maxViews,
      remainingViews: maxViews,
    });

    const origin = new URL(req.url).origin;
    return NextResponse.json({ id: rec.id, url: `${origin}/p/${rec.id}` }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/pastes crashed:", e);
    return NextResponse.json(
      { error: "internal_server_error", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}