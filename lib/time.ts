export function nowMs(req: Request) {
  if (process.env.TEST_MODE === "1") {
    const h = req.headers.get("x-test-now-ms");
    if (h) {
      const n = Number(h);
      if (!Number.isNaN(n)) return n;
    }
  }
  return Date.now();
}