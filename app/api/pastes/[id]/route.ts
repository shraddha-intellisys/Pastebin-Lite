import { NextResponse } from "next/server";
import { nowMs } from "../../../../lib/time";
import { getPaste, deletePaste, consumeView } from "../../../../lib/store";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const paste = await getPaste(ctx.params.id);
  if (!paste) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const now = nowMs(req);

  if (paste.expiresAtMs !== null && now > paste.expiresAtMs) {
    await deletePaste(ctx.params.id);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let remaining_views = null;

  if (paste.maxViews !== null) {
    const r = await consumeView(ctx.params.id);
    if (r === null) return NextResponse.json({ error: "not_found" }, { status: 404 });
    remaining_views = r;
  }

  return NextResponse.json({
    content: paste.content,
    remaining_views,
    expires_at: paste.expiresAtMs
      ? new Date(paste.expiresAtMs).toISOString()
      : null,
  });
}