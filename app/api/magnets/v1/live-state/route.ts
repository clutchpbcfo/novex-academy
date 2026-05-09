// app/api/magnets/v1/live-state/route.ts
// GET -> { isLive, source, currentViewers, startedAt, lastChecked }
//
// Polled by the /live page client island every 30s. Edge cache window is
// dynamic — 60s when live, 5min when offline — so YT API quota stays safe and
// stream-state changes propagate within ~30-60s of Hermes pushing an update.

import { NextResponse } from 'next/server'
import { getDynamicLiveState } from '@/lib/live/state'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  const state = await getDynamicLiveState()
  const { cacheSeconds, ...payload } = state
  const res = NextResponse.json(payload)
  // Edge cache: keeps shared state across instances inside the cache window,
  // so a single backend hit per region per cache-window covers all polling clients.
  res.headers.set(
    'Cache-Control',
    `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${Math.min(cacheSeconds * 2, 600)}`,
  )
  return res
}
