export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { nowMs } from "../../../../lib/time";
import { getPaste, deletePaste, consumeView } from "../../../../lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  try {
    const paste = await getPaste(id);
    if (!paste) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const now = nowMs(req);

    // TTL check
    if (paste.expiresAtMs !== null && now > paste.expiresAtMs) {
      await deletePaste(id);
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    let remaining_views: number | null = null;

    // Each successful API fetch counts as a view
    if (paste.maxViews !== null) {
      const r = await consumeView(id);
      if (r === null) return NextResponse.json({ error: "not_found" }, { status: 404 });
      remaining_views = r;
    }

    return NextResponse.json(
      {
        content: paste.content,
        remaining_views,
        expires_at: paste.expiresAtMs ? new Date(paste.expiresAtMs).toISOString() : null,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("GET /api/pastes/[id] crashed:", e);
    return NextResponse.json(
      { error: "internal_server_error", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}