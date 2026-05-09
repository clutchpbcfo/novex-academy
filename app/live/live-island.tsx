'use client'
// app/live/live-island.tsx
// Small client component that polls /api/magnets/v1/live-state every 30s and
// renders the dynamic chrome (pill + viewer count + uptime). The iframe stays
// stable in the parent server component — YouTube's embed/live_stream handles
// its own offline/online transitions, so we never need to remount it.
//
// Hard requirement: stream crash + auto-restart cycle reflects within 30s.

import { useEffect, useState } from 'react'

interface DynamicState {
  isLive: boolean
  source: 'hermes' | 'youtube_api' | 'env_fallback'
  currentViewers: number | null
  startedAt: number | null
  lastChecked: string
}

interface Props {
  initial: DynamicState
  /** Polling cadence in ms. Spec calls for 30s. */
  pollMs?: number
}

export function LiveStateIsland({ initial, pollMs = 30_000 }: Props) {
  const [state, setState] = useState<DynamicState>(initial)
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000))

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setInterval> | null = null

    async function fetchOnce() {
      try {
        const res = await fetch('/api/magnets/v1/live-state', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as DynamicState
        if (!cancelled) setState(data)
      } catch {
        // network blip — keep last-known state, try again next tick
      }
    }

    // Initial fetch happens on mount (in case SSR initial is stale)
    fetchOnce()
    timer = setInterval(fetchOnce, pollMs)

    // Tick uptime label once per second so "Started 4m ago" stays accurate
    const tick = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
      clearInterval(tick)
    }
  }, [pollMs])

  return (
    <div className="flex flex-col items-end gap-1.5 md:items-end">
      <Pill isLive={state.isLive} />
      {state.isLive && (
        <div className="flex items-center gap-3 text-xs text-white/55">
          {state.startedAt && <span>Started {formatUptime(now - state.startedAt)} ago</span>}
          {typeof state.currentViewers === 'number' && (
            <span>
              <span className="text-white/80 font-semibold">{state.currentViewers.toLocaleString()}</span> watching
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function Pill({ isLive }: { isLive: boolean }) {
  if (isLive) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-1.5 text-sm font-semibold text-[#10B981]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-60"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]"></span>
        </span>
        Live now
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/50">
      <span className="h-2 w-2 rounded-full bg-white/30"></span>
      Offline
    </span>
  )
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.max(seconds, 0)}s`
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const remM = m % 60
  return remM ? `${h}h ${remM}m` : `${h}h`
}
