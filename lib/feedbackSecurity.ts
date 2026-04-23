/**
 * Bug report /feedback API: HTML escaping, wallet masking for public blobs, IP rate limit.
 * Rate limit is per server instance (serverless); combine with Vercel WAF or Upstash for global limits.
 */

const WINDOW_MS = Number(process.env.FEEDBACK_RATE_WINDOW_MS) || 15 * 60 * 1000;
const MAX_REQUESTS = Number(process.env.FEEDBACK_RATE_LIMIT_MAX) || 5;

/** Per-instance sliding window (IP → timestamps). */
const rateBucket = new Map<string, number[]>();

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Public JSON blobs: avoid full wallet in clear text. */
export function maskWallet(wallet: string): string {
  const w = wallet.trim();
  if (!w) return "";
  if (w.length <= 12) return "[redacted]";
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

export function getClientIp(req: { headers: Headers }): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  return "unknown";
}

export function checkFeedbackRateLimit(
  ip: string,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const prev = rateBucket.get(ip) ?? [];
  const recent = prev.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    const oldest = Math.min(...recent);
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  recent.push(now);
  rateBucket.set(ip, recent);
  return { ok: true };
}

/** Common bot/scraper user-agents — not exhaustive, just cheap first-pass defense. */
const BOT_UA_PATTERNS: RegExp[] = [
  /\bcurl\//i,
  /\bwget\//i,
  /\bpython-requests\//i,
  /\bgo-http-client\//i,
  /\bokhttp\//i,
  /\bnode-fetch\//i,
  /\baxios\//i,
  /\bphantomjs\//i,
  /\bheadlesschrome\//i,
  /\bbot\b/i,
  /\bcrawler\b/i,
  /\bspider\b/i,
  /\bscraper\b/i,
];

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return true; // no UA header at all → suspicious
  const u = ua.trim();
  if (u.length < 8) return true;
  return BOT_UA_PATTERNS.some((re) => re.test(u));
}

/** Honeypot: if a hidden field was filled, it's a bot. Empty string from humans. */
export function honeypotTripped(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/** Min description length — blocks one-char spam. */
export const MIN_DESCRIPTION_CHARS = 10;

/** Min elapsed ms between modal-open and submit. Humans take >2s to fill. */
export const MIN_SUBMIT_DELTA_MS = 2000;

