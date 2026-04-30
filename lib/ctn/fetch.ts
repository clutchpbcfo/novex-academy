/**
 * lib/ctn/fetch.ts
 *
 * Shared fetcher for ctn-api.novex.finance (the live CTN endpoint
 * exposed by ~/ctn/ctn_dashboard.py via the cloudflared tunnel).
 *
 * Three things to know:
 *   1. ctn-api blocks scripts that send a non-browser User-Agent — we
 *      always send a browser-like UA. Memory:
 *      `feedback_ctn_api_blocks_custom_user_agents.md`.
 *   2. The cloudflared tunnel occasionally flaps; one retry on 4xx/5xx
 *      with a short delay clears the flap. Mirrors the
 *      `/api/ctn-state` proxy pattern in novex-quests.
 *   3. Vercel's CDN will cache route-handler responses unless we
 *      pass `cache: 'no-store'`. For live data we always set it.
 */

const BASE = 'https://ctn-api.novex.finance';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface FetchCtnOpts {
  /** Per-call timeout in ms. Default 6000. */
  timeoutMs?: number;
  /** Single retry on first failure (matches /api/ctn-state pattern). */
  retry?: boolean;
}

/**
 * Fetch a path from ctn-api.novex.finance and parse it as JSON.
 * Throws on network errors, non-2xx responses (after retry), or
 * invalid JSON. Callers should wrap in try/catch and degrade
 * gracefully (return empty data + flag so the UI can render a
 * skeleton or stale-warn).
 */
export async function fetchCtn<T = unknown>(
  path: string,
  opts: FetchCtnOpts = {},
): Promise<T> {
  const { timeoutMs = 6000, retry = true } = opts;
  const url = path.startsWith('http') ? path : `${BASE}${path}`;

  const attempt = async (): Promise<T> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        cache: 'no-store',
        signal: ctrl.signal,
      });
      if (!res.ok) {
        throw new Error(`ctn-api ${path} returned ${res.status}`);
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await attempt();
  } catch (err) {
    if (!retry) throw err;
    await new Promise((r) => setTimeout(r, 400));
    return attempt();
  }
}
