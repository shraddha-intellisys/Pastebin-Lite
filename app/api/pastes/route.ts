// app/api/pastes/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createPaste, type PasteRecord } from "../../../lib/store";

export const runtime = "nodejs";

function isPosInt(n: any) {
  return Number.isInteger(n) && n >= 1;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const content = body?.content;
    const ttl_seconds = body?.ttl_seconds;
    const max_views = body?.max_views;

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "content must be a non-empty string" },
        { status: 400 }
      );
    }

    if (ttl_seconds !== undefined && !isPosInt(ttl_seconds)) {
      return NextResponse.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }

    if (max_views !== undefined && !isPosInt(max_views)) {
      return NextResponse.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }

    const id = crypto.randomBytes(8).toString("hex");
    const now = Date.now();

    const expiresAtMs = ttl_seconds ? now + ttl_seconds * 1000 : null;
    const maxViews = max_views ?? null;

    const rec: PasteRecord = {
      id,
      content,
      createdAtMs: now,
      expiresAtMs,
      maxViews,
      remainingViews: maxViews, // IMPORTANT: remaining starts at max_views
    };

    await createPaste(rec);

    const origin = new URL(req.url).origin;
    return NextResponse.json(
      { id, url: `${origin}/p/${id}` },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("POST /api/pastes failed:", e);
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 }
    );
  }
}