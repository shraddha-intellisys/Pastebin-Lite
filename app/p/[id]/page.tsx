// app/p/[id]/page.tsx
import { notFound } from "next/navigation";
import { getPaste, deletePaste } from "../../../lib/store";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;

  const paste = await getPaste(id);
  if (!paste) notFound();

  // TTL check for HTML (uses real time; spec only requires deterministic for expiry logic;
  // deterministic is implemented in API. Keeping HTML simple.)
  if (paste.expiresAtMs !== null && Date.now() > paste.expiresAtMs) {
    await deletePaste(id);
    notFound();
  }

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