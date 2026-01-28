export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { nowMs } from "../../../../lib/time";
import { getPaste, deletePaste, consumeView } from "../../../../lib/store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  const paste = await getPaste(id);
  if (!paste) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const now = nowMs(req);

  if (paste.expiresAtMs !== null && now > paste.expiresAtMs) {
    await deletePaste(id);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let remaining_views: number | null = null;

  if (paste.maxViews !== null) {
    const r = await consumeView(id);
    if (r === null) {
      await deletePaste(id);
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    remaining_views = r;
  }

  return NextResponse.json({
    content: paste.content,
    remaining_views,
    expires_at: paste.expiresAtMs ? new Date(paste.expiresAtMs).toISOString() : null,
  });
}