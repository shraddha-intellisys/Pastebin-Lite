# Pastebin-Lite

A small Pastebin-like app: create a text paste, get a shareable URL, and view it.
Supports optional TTL expiry and optional max view count.

## Tech
- Next.js (App Router)
- Vercel KV (`@vercel/kv`) for persistence

## Run locally
1. Install deps:
   - `npm install`

2. Create `.env.local`:
   - `KV_REST_API_URL=...`
   - `KV_REST_API_TOKEN=...`
   (values from Vercel Dashboard -> Storage -> KV)

3. Start dev server:
   - `npm run dev`

## Persistence layer
Vercel KV (Redis via Upstash) is used to persist pastes across serverless requests.

## Design decisions
- Paste metadata stored as JSON under `paste:<id>`
- View count stored as integer counter under `paste:<id>:views`
- API fetch uses atomic `DECR` for view counting (safe under concurrency)
- TTL enforced by comparing `expiresAtMs` against current time
- Deterministic expiry testing supported when `TEST_MODE=1` using `x-test-now-ms` header for expiry logic.