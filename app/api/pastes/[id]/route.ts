import { NextResponse } from "next/server";
import { getPaste, savePaste, deletePaste } from "../../../../lib/store";

function getNowMs(req: Request) {
  if (process.env.TEST_MODE === "1") {
    const h = req.headers.get("x-test-now-ms");
    if (h) {
      const n = Number(h);
      if (!Number.isNaN(n)) return n;
    }
  }
  return Date.now();
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const paste = await getPaste(id);
  if (!paste) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const now = getNowMs(req);

  // TTL check
  if (paste.expiresAtMs !== null && now > paste.expiresAtMs) {
    await deletePaste(id);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Views check
  if (paste.remainingViews !== null) {
    if (paste.remainingViews <= 0) {
      await deletePaste(id);
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    paste.remainingViews -= 1;
    await savePaste(paste);
  }

  return NextResponse.json(
    {
      content: paste.content,
      remaining_views: paste.remainingViews,
      expires_at: paste.expiresAtMs ? new Date(paste.expiresAtMs).toISOString() : null,
    },
    { status: 200 }
  );
}