// app/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCreate() {
    setError(null);
    setResult(null);

    const body: any = { content };

    if (ttl.trim() !== "") body.ttl_seconds = Number(ttl);
    if (maxViews.trim() !== "") body.max_views = Number(maxViews);

    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setError(json?.error ?? "failed_to_create");
      return;
    }

    setResult(json);
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1>Pastebin Lite (Local)</h1>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste content..."
        rows={8}
        style={{ width: "100%", padding: 10 }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <input
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
          placeholder="ttl_seconds (optional)"
        />
        <input
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
          placeholder="max_views (optional)"
        />
        <button onClick={onCreate}>Create</button>
      </div>

      {error && (
        <p style={{ marginTop: 12, color: "crimson" }}>
          Error: {error}
        </p>
      )}

      {result && (
        <p style={{ marginTop: 12 }}>
          Created:{" "}
          <a href={result.url} target="_blank" rel="noreferrer">
            {result.url}
          </a>
        </p>
      )}
    </main>
  );
}