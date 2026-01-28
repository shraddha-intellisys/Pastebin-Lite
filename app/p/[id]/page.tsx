import { notFound } from "next/navigation";
import { getPaste, deletePaste } from "../../../lib/store";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;

  const paste = await getPaste(id);
  if (!paste) notFound();

  if (paste.expiresAtMs !== null && Date.now() > paste.expiresAtMs) {
    await deletePaste(id);
    notFound();
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>Paste</h1>
      <pre style={{ whiteSpace: "pre-wrap", background: "#eee", padding: 16 }}>
        {paste.content}
      </pre>
    </main>
  );
}