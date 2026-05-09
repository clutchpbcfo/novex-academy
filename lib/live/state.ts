// lib/live/state.ts
// Reads Hermes director state for the live indicator + primary stream URL.
// Hardened for "no env / no live stream / no Hermes blob yet" — page ALWAYS returns 200
// with a presentable offline state. Marketing can test-fire OBS overlay + email CTAs
// against the URL even before Clutch's first stream goes live.
//
// Env precedence for primary embed (any one is enough):
//   NOVEX_LIVE_STREAM_BLOB_URL   — Hermes director publishes here once wired (preferred)
//   NOVEX_LIVE_YT_CHANNEL_ID     — auto-shows current live on a channel (resilient)
//   NOVEX_LIVE_YT_VIDEO_ID       — explicit video id (most precise)
// If none set, page renders the "stream offline" tile + working watch links.

const STALE_AFTER_SECONDS = 10 * 60

export type StreamPlatform = 'youtube' | 'twitch' | 'kick' | 'x'

export interface LiveState {
  online: boolean
  primary: {
    platform: StreamPlatform
    embedUrl: string         // empty string -> render offline tile
    watchUrl: string         // always populated
  }
  destinations: Array<{
    platform: StreamPlatform
    label: string
    watchUrl: string
  }>
  startedAt: number | null
  lastUpdate: number | null
}

interface HermesStreamBlob {
  online?: boolean
  started_at?: number
  updated_at?: number
  primary_platform?: StreamPlatform
  destinations?: Array<{ platform: StreamPlatform; watch_url: string }>
  youtube_video_id?: string
  youtube_channel_id?: string
  twitch_channel?: string
  kick_channel?: string
  x_handle?: string
}

// Hardcoded Novex defaults — match memory ref @NovexFi (X), novexfinance (TW/Kick).
// YouTube channel + video are env-driven; if both missing we still render an
// "Open YouTube live" link to https://youtube.com/@NovexFi/live.
const DEFAULT_TWITCH = process.env.NOVEX_LIVE_TWITCH_CHANNEL ?? 'novexfinance'
const DEFAULT_KICK   = process.env.NOVEX_LIVE_KICK_CHANNEL   ?? 'novexfinance'
const DEFAULT_X      = process.env.NOVEX_LIVE_X_HANDLE       ?? 'NovexFi'
const DEFAULT_YT_HANDLE = process.env.NOVEX_LIVE_YT_HANDLE   ?? 'NovexFi'
const YT_VIDEO_ID    = process.env.NOVEX_LIVE_YT_VIDEO_ID    ?? ''
const YT_CHANNEL_ID  = process.env.NOVEX_LIVE_YT_CHANNEL_ID  ?? ''
const STREAM_BLOB_URL = process.env.NOVEX_LIVE_STREAM_BLOB_URL ?? ''

const EMBED_HOSTS = (process.env.NOVEX_LIVE_EMBED_PARENTS ?? 'academy.novex.finance,novex.finance')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

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

function buildFromEnv(): LiveState {
  // Even with no Hermes blob, render destinations + a primary embed if a YT
  // channel id is set (which YouTube renders as "this channel is currently
  // offline" when nothing is live — that's still a 200 OK page Marketing can test).
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
    return {
      platform: 'twitch',
      embedUrl: `https://player.twitch.tv/?channel=${ch}&${parents}`,
      watchUrl: `https://twitch.tv/${ch}`,
    }
  }
  if (platform === 'kick') {
    const ch = data.kick_channel ?? DEFAULT_KICK
    return {
      platform: 'kick',
      embedUrl: `https://player.kick.com/${ch}`,
      watchUrl: `https://kick.com/${ch}`,
    }
  }
  if (platform === 'x') {
    const handle = data.x_handle ?? DEFAULT_X
    return {
      platform: 'x',
      // X Live doesn't reliably embed; keep watch link, render offline tile in the embed slot.
      embedUrl: '',
      watchUrl: `https://x.com/${handle}/live`,
    }
  }
  // youtube — try video id, then channel id (auto-live-stream), else handle/live link
  const videoId = data.youtube_video_id ?? YT_VIDEO_ID
  const channelId = data.youtube_channel_id ?? YT_CHANNEL_ID
  let embedUrl = ''
  let watchUrl = `https://www.youtube.com/@${DEFAULT_YT_HANDLE}/live`
  if (videoId) {
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
    watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  } else if (channelId) {
    // YouTube renders "channel is offline" placeholder if nothing is currently live.
    // Page still returns 200; embed shows graceful state.
    embedUrl = `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1`
    watchUrl = `https://www.youtube.com/channel/${channelId}/live`
  }
  return { platform: 'youtube', embedUrl, watchUrl }
}

function buildDestinations(data: HermesStreamBlob): LiveState['destinations'] {
  if (data.destinations?.length) {
    return data.destinations.map(d => ({
      platform: d.platform,
      label: labelFor(d.platform),
      watchUrl: d.watch_url,
    }))
  }
  const ytWatch =
    data.youtube_video_id || YT_VIDEO_ID
      ? `https://www.youtube.com/watch?v=${data.youtube_video_id ?? YT_VIDEO_ID}`
      : `https://www.youtube.com/@${DEFAULT_YT_HANDLE}/live`
  return [
    { platform: 'youtube', label: 'Watch on YouTube', watchUrl: ytWatch },
    { platform: 'twitch',  label: 'Watch on Twitch',  watchUrl: `https://twitch.tv/${data.twitch_channel ?? DEFAULT_TWITCH}` },
    { platform: 'kick',    label: 'Watch on Kick',    watchUrl: `https://kick.com/${data.kick_channel ?? DEFAULT_KICK}` },
    { platform: 'x',       label: 'Watch on X',       watchUrl: `https://x.com/${data.x_handle ?? DEFAULT_X}/live` },
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
