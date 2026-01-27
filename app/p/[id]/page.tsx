import { notFound } from "next/navigation";
import { getPaste, savePaste, deletePaste } from "../../../lib/store";

type PageProps = { params: Promise<{ id: string }> };

function getNowMs(headers: Headers) {
  if (process.env.TEST_MODE === "1") {
    const h = headers.get("x-test-now-ms");
    if (h) {
      const n = Number(h);
      if (!Number.isNaN(n)) return n;
    }
  }
  return Date.now();
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;

  const paste = await getPaste(id);
  if (!paste) notFound();

  const now = getNowMs(new Headers()); // (HTML route doesn't receive req headers easily here)

  // TTL check
  if (paste.expiresAtMs !== null && now > paste.expiresAtMs) {
    await deletePaste(id);
    notFound();
  }

  // View limit check (HTML view should also count as a view? Spec only says API fetch counts.
  // So we DO NOT decrement here.)
  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1>Paste</h1>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f4f4f4",
          padding: 12,
          borderRadius: 6,
        }}
      >
        {paste.content}
      </pre>
    </main>
  );
}