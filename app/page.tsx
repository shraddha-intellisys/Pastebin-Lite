"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState<string>("");
  const [views, setViews] = useState<string>("");
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string>("");

  async function onCreate() {
    setError("");
    setResult(null);

    const body: any = { content };

    if (ttl.trim() !== "") body.ttl_seconds = Number(ttl);
    if (views.trim() !== "") body.max_views = Number(views);

    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error ?? "Failed");
      return;
    }

    setResult(data);
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1>Pastebin-Lite</h1>

      <label style={{ display: "block", marginTop: 12 }}>Content *</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={{ width: "100%", padding: 10 }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <div>
          <label>TTL seconds (optional)</label>
          <input
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            placeholder="e.g. 60"
            style={{ display: "block", padding: 8, width: 200 }}
          />
        </div>

        <div>
          <label>Max views (optional)</label>
          <input
            value={views}
            onChange={(e) => setViews(e.target.value)}
            placeholder="e.g. 5"
            style={{ display: "block", padding: 8, width: 200 }}
          />
        </div>
      </div>

      <button onClick={onCreate} style={{ marginTop: 16, padding: "10px 14px" }}>
        Create Paste
      </button>

      {error && <p style={{ marginTop: 12 }}>{error}</p>}

      {result && (
        <p style={{ marginTop: 12 }}>
          Share URL:{" "}
          <a href={result.url} target="_blank" rel="noreferrer">
            {result.url}
          </a>
        </p>
      )}
    </main>
  );
}