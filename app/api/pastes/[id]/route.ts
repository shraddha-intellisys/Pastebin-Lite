// app/api/pastes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nowMs } from "../../../../lib/time";
import { getPaste, deletePaste, consumeView } from "../../../../lib/store";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  const paste = await getPaste(id);
  if (!paste) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const now = nowMs(req);

  // TTL check (deterministic in TEST_MODE)
  if (paste.expiresAtMs !== null && now > paste.expiresAtMs) {
    await deletePaste(id);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // view count: only API fetch counts
  let remaining_views: number | null = null;

  if (paste.maxViews !== null) {
    const r = await consumeView(id);
    if (r === null) {
      // exhausted -> unavailable
      await deletePaste(id);
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    remaining_views = r;
  }

  return NextResponse.json(
    {
      content: paste.content,
      remaining_views,
      expires_at: paste.expiresAtMs
        ? new Date(paste.expiresAtMs).toISOString()
        : null,
    },
    { status: 200 }
  );
}