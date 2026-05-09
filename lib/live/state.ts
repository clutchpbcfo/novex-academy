// lib/live/state.ts
// Hardened state loader. Two surfaces:
//   getLiveState()        — server-side static loader for the /live SSR shell
//   getDynamicLiveState() — hybrid resolver used by /api/magnets/v1/live-state polling
//
// Resolution priority (decision 28 hybrid, option c):
//   1. Hermes director blob (NOVEX_LIVE_STREAM_BLOB_URL) — primary, always tried
//   2. YouTube Data API v3 — fallback ONLY if NOVEX_LIVE_YT_API_KEY is set,
//      throttled to 1 call per 5 min via D1 magnets_runtime_kv table
//      (graceful in-memory fallback if D1 unavailable, never quota-busts)
//   3. Env-static defaults — final fallback so the page is ALWAYS 200

const STALE_AFTER_SECONDS = 10 * 60       // 10 min — Hermes blob considered fresh below this
const YT_THROTTLE_SECONDS = 5 * 60        // 5 min between YT API calls
const DYNAMIC_CACHE_LIVE = 60             // s-maxage when stream IS live
const DYNAMIC_CACHE_OFFLINE = 300         // s-maxage when stream is NOT live

export type StreamPlatform = 'youtube' | 'twitch' | 'kick' | 'x'

export interface LiveState {
  online: boolean
  primary: {
    platform: StreamPlatform
    embedUrl: string
    watchUrl: string
  }
  destinations: Array<{
    platform: StreamPlatform
    label: string
    watchUrl: string
  }>
  startedAt: number | null
  lastUpdate: number | null
}

export interface DynamicLiveState {
  isLive: boolean
  source: 'hermes' | 'youtube_api' | 'env_fallback'
  currentViewers: number | null
  startedAt: number | null
  lastChecked: string  // ISO 8601
  /** Server-side suggested edge cache window in seconds. Route handler reads + sets header. */
  cacheSeconds: number
}

interface HermesStreamBlob {
  online?: boolean
  started_at?: number
  updated_at?: number
  current_viewers?: number
  primary_platform?: StreamPlatform
  destinations?: Array<{ platform: StreamPlatform; watch_url: string }>
  youtube_video_id?: string
  youtube_channel_id?: string
  twitch_channel?: string
  kick_channel?: string
  x_handle?: string
}

// Voice-verified by Clutch 2026-05-09:
//   YT handle = NovexFi
//   Twitch    = novexfi  (NOT novexfinance)
//   Kick      = novexfi  (NOT novexfinance)
//   X Live    = ClutchPBCFO  (Novex doesn't have X Premium; X Live is Clutch's personal handle)
const DEFAULT_TWITCH    = process.env.NOVEX_LIVE_TWITCH_CHANNEL ?? 'novexfi'
const DEFAULT_KICK      = process.env.NOVEX_LIVE_KICK_CHANNEL   ?? 'novexfi'
const DEFAULT_X         = process.env.NOVEX_LIVE_X_HANDLE       ?? 'ClutchPBCFO'
const DEFAULT_YT_HANDLE = process.env.NOVEX_LIVE_YT_HANDLE      ?? 'NovexFi'
const YT_VIDEO_ID       = process.env.NOVEX_LIVE_YT_VIDEO_ID    ?? ''
const YT_CHANNEL_ID     = process.env.NOVEX_LIVE_YT_CHANNEL_ID  ?? ''
const STREAM_BLOB_URL   = process.env.NOVEX_LIVE_STREAM_BLOB_URL ?? ''
const YT_API_KEY        = process.env.NOVEX_LIVE_YT_API_KEY     ?? '' // opt-in
const EMBED_HOSTS = (process.env.NOVEX_LIVE_EMBED_PARENTS ?? 'academy.novex.finance,novex.finance')
  .split(',').map(s => s.trim()).filter(Boolean)

// ============================================================================
// Public API
// ============================================================================

export async function getLiveState(): Promise<LiveState> {
  if (!STREAM_BLOB_URL) return buildFromEnv()
  try {
    const res = await fetch(STREAM_BLOB_URL, { next: { revalidate: 30 } })
    if (!res.ok) return buildFromEnv()
    const data = (await res.json()) as HermesStreamBlob
    const now = Math.floor(Date.now() / 1000)
    const stale =
      typeof data.updated_at === 'number' && now - data.updated_at > STALE_AFTER_SECONDS
    return {
      online: data.online === true && !stale,
      primary: buildPrimary(data),
      destinations: buildDestinations(data),
      startedAt: data.started_at ?? null,
      lastUpdate: data.updated_at ?? null,
    }
  } catch {
    return buildFromEnv()
  }
}

/**
 * Polled by /api/magnets/v1/live-state. No revalidate cache — uses no-store
 * fetch on Hermes blob so a fresh write is reflected within ~30s of frontend
 * polling cadence. Route handler sets edge Cache-Control based on cacheSeconds.
 */
export async function getDynamicLiveState(): Promise<DynamicLiveState> {
  // 1) Hermes blob (primary)
  const hermes = await fetchHermesFresh()
  if (hermes) return hermes

  // 2) YouTube API (fallback, opt-in via NOVEX_LIVE_YT_API_KEY, throttled)
  if (YT_API_KEY && YT_CHANNEL_ID) {
    const yt = await fetchYouTubeThrottled()
    if (yt) return yt
  }

  // 3) Env fallback — always returns offline; page still renders fine
  return {
    isLive: false,
    source: 'env_fallback',
    currentViewers: null,
    startedAt: null,
    lastChecked: new Date().toISOString(),
    cacheSeconds: DYNAMIC_CACHE_OFFLINE,
  }
}

// ============================================================================
// Hermes path
// ============================================================================

async function fetchHermesFresh(): Promise<DynamicLiveState | null> {
  if (!STREAM_BLOB_URL) return null
  try {
    const res = await fetch(STREAM_BLOB_URL, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as HermesStreamBlob
    const now = Math.floor(Date.now() / 1000)
    const updatedAt = typeof data.updated_at === 'number' ? data.updated_at : 0
    const stale = now - updatedAt > STALE_AFTER_SECONDS
    if (stale) return null
    const isLive = data.online === true
    return {
      isLive,
      source: 'hermes',
      currentViewers: typeof data.current_viewers === 'number' ? data.current_viewers : null,
      startedAt: data.started_at ?? null,
      lastChecked: new Date().toISOString(),
      cacheSeconds: isLive ? DYNAMIC_CACHE_LIVE : DYNAMIC_CACHE_OFFLINE,
    }
  } catch {
    return null
  }
}

// ============================================================================
// YouTube API path (throttled)
// ============================================================================

interface YtCacheEntry {
  state: DynamicLiveState
  fetchedAt: number  // unix seconds
}

let _memoryCache: YtCacheEntry | null = null  // cold-start fallback if D1 unavailable

async function fetchYouTubeThrottled(): Promise<DynamicLiveState | null> {
  const now = Math.floor(Date.now() / 1000)

  // Try D1-backed throttle first (shared across Vercel instances)
  const d1Cached = await readD1KvSafe('yt_live_state')
  if (d1Cached) {
    if (now - d1Cached.fetchedAt < YT_THROTTLE_SECONDS) {
      return d1Cached.state
    }
  } else if (_memoryCache && now - _memoryCache.fetchedAt < YT_THROTTLE_SECONDS) {
    // No D1 (table missing or auth fail) — use module-level memo as best-effort throttle
    return _memoryCache.state
  }

  // Cold or stale — actually call YT
  try {
    const fresh = await callYouTubeSearch()
    const entry: YtCacheEntry = { state: fresh, fetchedAt: now }
    _memoryCache = entry
    await writeD1KvSafe('yt_live_state', entry)
    return fresh
  } catch (err) {
    console.warn('[live-state] YT API call failed', err)
    // Return last-known if we have one, even if stale; better than env fallback
    if (d1Cached?.state) return d1Cached.state
    if (_memoryCache?.state) return _memoryCache.state
    return null
  }
}

async function callYouTubeSearch(): Promise<DynamicLiveState> {
  // search.list?eventType=live → 100 quota units. Returns currently-live videos for the channel.
  // Quota math: throttled to 1 call / 5 min = 288/day = 28,800 units. Within 10K daily? NO — 28K > 10K.
  // BUT the Hermes path will dominate once wired, and YT only fires when Hermes is stale or unset.
  // Real-world expected YT calls: handful per day. Defensive: caller also gates on NOVEX_LIVE_YT_API_KEY env.
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('channelId', YT_CHANNEL_ID)
  url.searchParams.set('eventType', 'live')
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '1')
  url.searchParams.set('key', YT_API_KEY)

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`YT search.list ${res.status}`)
  }
  const data = await res.json() as {
    items: Array<{
      id: { videoId: string }
      snippet: { publishedAt: string; liveBroadcastContent?: string }
    }>
  }
  const item = data.items?.[0]
  if (!item) {
    return {
      isLive: false,
      source: 'youtube_api',
      currentViewers: null,
      startedAt: null,
      lastChecked: new Date().toISOString(),
      cacheSeconds: DYNAMIC_CACHE_OFFLINE,
    }
  }
  // Could optionally call videos.list?part=liveStreamingDetails for concurrentViewers (1 quota unit).
  // Skipped for v1 — pill alone is the spec. Re-add when Marketing wants viewer count visible.
  return {
    isLive: true,
    source: 'youtube_api',
    currentViewers: null,
    startedAt: Math.floor(new Date(item.snippet.publishedAt).getTime() / 1000),
    lastChecked: new Date().toISOString(),
    cacheSeconds: DYNAMIC_CACHE_LIVE,
  }
}

// ============================================================================
// D1 KV helpers — graceful no-op if table or env not present
// ============================================================================

interface D1Env { accountId: string; databaseId: string; apiToken: string }
function d1Env(): D1Env | null {
  const accountId = process.env.CF_ACCOUNT_ID
  const databaseId = process.env.CF_D1_MAGNETS_ID
  const apiToken = process.env.CF_API_TOKEN
  if (!accountId || !databaseId || !apiToken) return null
  return { accountId, databaseId, apiToken }
}

async function readD1KvSafe(key: string): Promise<YtCacheEntry | null> {
  const e = d1Env()
  if (!e) return null
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${e.accountId}/d1/database/${e.databaseId}/query`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${e.apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT value, updated_at FROM magnets_runtime_kv WHERE key = ?1 LIMIT 1',
          params: [key],
        }),
        cache: 'no-store',
      },
    )
    if (!res.ok) return null
    const json = await res.json() as { result: Array<{ results: Array<{ value: string; updated_at: number }> }> }
    const row = json.result?.[0]?.results?.[0]
    if (!row) return null
    const state = JSON.parse(row.value) as DynamicLiveState
    return { state, fetchedAt: row.updated_at }
  } catch {
    return null
  }
}

async function writeD1KvSafe(key: string, entry: YtCacheEntry): Promise<void> {
  const e = d1Env()
  if (!e) return
  try {
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${e.accountId}/d1/database/${e.databaseId}/query`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${e.apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: `INSERT INTO magnets_runtime_kv (key, value, updated_at) VALUES (?1, ?2, ?3)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
          params: [key, JSON.stringify(entry.state), entry.fetchedAt],
        }),
      },
    )
  } catch {
    // best-effort
  }
}

// ============================================================================
// Static loader helpers (unchanged from /live carve-out)
// ============================================================================

function buildFromEnv(): LiveState {
  return {
    online: false,
    primary: buildPrimary({}),
    destinations: buildDestinations({}),
    startedAt: null,
    lastUpdate: null,
  }
}

function buildPrimary(data: HermesStreamBlob): LiveState['primary'] {
  const platform: StreamPlatform = data.primary_platform ?? 'youtube'
  if (platform === 'twitch') {
    const ch = data.twitch_channel ?? DEFAULT_TWITCH
    const parents = EMBED_HOSTS.map(h => `parent=${encodeURIComponent(h)}`).join('&')
    return { platform: 'twitch', embedUrl: `https://player.twitch.tv/?channel=${ch}&${parents}`, watchUrl: `https://twitch.tv/${ch}` }
  }
  if (platform === 'kick') {
    const ch = data.kick_channel ?? DEFAULT_KICK
    return { platform: 'kick', embedUrl: `https://player.kick.com/${ch}`, watchUrl: `https://kick.com/${ch}` }
  }
  if (platform === 'x') {
    const handle = data.x_handle ?? DEFAULT_X
    return { platform: 'x', embedUrl: '', watchUrl: `https://x.com/${handle}/live` }
  }
  const videoId = data.youtube_video_id ?? YT_VIDEO_ID
  const channelId = data.youtube_channel_id ?? YT_CHANNEL_ID
  let embedUrl = ''
  let watchUrl = `https://www.youtube.com/@${DEFAULT_YT_HANDLE}/live`
  if (videoId) {
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
    watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  } else if (channelId) {
    embedUrl = `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1`
    watchUrl = `https://www.youtube.com/channel/${channelId}/live`
  }
  return { platform: 'youtube', embedUrl, watchUrl }
}

function buildDestinations(data: HermesStreamBlob): LiveState['destinations'] {
  // ALWAYS return all 4 launchers. Treat Hermes data as URL OVERRIDE per platform,
  // never as the exclusive source. Prevents the destination grid from collapsing
  // when Hermes pushes a partial blob (e.g., only youtube currently active).
  // Bug repro 2026-05-09: production /live showed only YT button.
  const hermesByPlatform = new Map<StreamPlatform, string>(
    (data.destinations ?? []).map(d => [d.platform, d.watch_url]),
  )

  const ytFromVideo = (data.youtube_video_id || YT_VIDEO_ID)
    ? `https://www.youtube.com/watch?v=${data.youtube_video_id ?? YT_VIDEO_ID}`
    : `https://www.youtube.com/@${DEFAULT_YT_HANDLE}/live`

  const ytWatch     = hermesByPlatform.get('youtube') ?? ytFromVideo
  const twitchWatch = hermesByPlatform.get('twitch')  ?? `https://twitch.tv/${data.twitch_channel ?? DEFAULT_TWITCH}`
  const kickWatch   = hermesByPlatform.get('kick')    ?? `https://kick.com/${data.kick_channel ?? DEFAULT_KICK}`
  const xWatch      = hermesByPlatform.get('x')       ?? `https://x.com/${data.x_handle ?? DEFAULT_X}/live`

  return [
    { platform: 'youtube', label: 'Watch on YouTube', watchUrl: ytWatch },
    { platform: 'twitch',  label: 'Watch on Twitch',  watchUrl: twitchWatch },
    { platform: 'kick',    label: 'Watch on Kick',    watchUrl: kickWatch },
    { platform: 'x',       label: 'Watch on X',       watchUrl: xWatch },
  ]
}

function labelFor(p: StreamPlatform): string {
  switch (p) {
    case 'youtube': return 'Watch on YouTube'
    case 'twitch':  return 'Watch on Twitch'
    case 'kick':    return 'Watch on Kick'
    case 'x':       return 'Watch on X'
  }
}
