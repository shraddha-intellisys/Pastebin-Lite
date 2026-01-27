"use client";

import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [views, setViews] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onCreate() {
    setError(null);
    setResultUrl(null);

    const payload: any = { content };

    if (ttl.trim() !== "") payload.ttl_seconds = Number(ttl);
    if (views.trim() !== "") payload.max_views = Number(views);

    setLoading(true);
    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create paste");
        return;
      }

      setResultUrl(data.url);
    } catch (e: any) {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Pastebin-Lite</h1>

      <label>Paste content *</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={{ width: "100%", marginTop: 8 }}
        placeholder="Type your paste here..."
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <label>TTL (seconds)</label>
          <input
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            type="number"
            min={1}
            style={{ width: "100%", marginTop: 6 }}
            placeholder="optional"
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Max views</label>
          <input
            value={views}
            onChange={(e) => setViews(e.target.value)}
            type="number"
            min={1}
            style={{ width: "100%", marginTop: 6 }}
            placeholder="optional"
          />
        </div>
      </div>

      <button
        onClick={onCreate}
        disabled={loading}
        style={{ marginTop: 14, padding: "10px 14px", cursor: "pointer" }}
      >
        {loading ? "Creating..." : "Create Paste"}
      </button>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {resultUrl && (
        <p style={{ marginTop: 12 }}>
          Shareable URL:{" "}
          <a href={resultUrl} target="_blank" rel="noreferrer">
            {resultUrl}
          </a>
        </p>
      )}
    </main>
  );
}