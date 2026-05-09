// app/live/page.tsx
// Single-page live route. P0 — Marketing OBS overlay + email drip CTAs target this URL.
// Spec: Conductor day-2 add-on (2026-05-09). Hardened to ALWAYS return 200, even with
// zero env vars set, so the URL is testable from the moment it deploys.
//
// - Primary embed: YouTube auto-live-stream by default (or Hermes-selected platform)
// - Offline-state tile rendered in embed slot when no embed URL is configured/available
// - "Live now" pill: green pulse if Hermes director state says online, else gray "Offline"
// - Same-tab nav (Bible: no target=_blank on internal links; external links default same-tab too)
// - Brand canon: cyan / purple / emerald / gold + dark #06070D
// - Mobile-first; stacks below md breakpoint
// - Footer: CTN $300→$300K hook + small CTA to /magnets + standard disclaimer

import type { Metadata } from 'next'
import { getLiveState, type LiveState, type StreamPlatform } from '@/lib/live/state'

export const metadata: Metadata = {
  title: 'Novex Live — CTN $300 → $300K challenge',
  description:
    'Watch the AI bot trade live across YouTube, Twitch, Kick, and X. Public $300 challenge wallet on Orderly Network.',
  openGraph: {
    title: 'Novex Live',
    description:
      'AI bot trading live. Public $300 → $300K challenge wallet. Watch on YouTube, Twitch, Kick, X.',
    type: 'website',
  },
}

// ISR every 30s so the live indicator stays fresh without burning compute.
export const revalidate = 30

export default async function LivePage() {
  const state = await getLiveState()
  return (
    <div className="min-h-screen bg-[#06070D] text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <Header state={state} />
        <PrimaryStream state={state} />
        <Destinations state={state} />
        <Footer />
      </div>
    </div>
  )
}

function Header({ state }: { state: LiveState }) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
      <div>
        <div className="mb-1 text-xs uppercase tracking-widest text-[#A855F7]">Novex</div>
        <h1 className="text-3xl font-bold md:text-4xl">
          <span className="text-[#00D4FF]">Live</span>
        </h1>
      </div>
      <LivePill online={state.online} />
    </div>
  )
}

function LivePill({ online }: { online: boolean }) {
  if (online) {
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

function PrimaryStream({ state }: { state: LiveState }) {
  if (state.primary.embedUrl) {
    return (
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        <iframe
          src={state.primary.embedUrl}
          title="Novex Live primary stream"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }
  return <OfflineTile watchUrl={state.primary.watchUrl} />
}

function OfflineTile({ watchUrl }: { watchUrl: string }) {
  // Polished offline state. Page reads as alive even before Clutch's first stream.
  // Marketing can drop the URL into OBS / email / threads with confidence.
  return (
    <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black via-[#0a0d18] to-black shadow-2xl">
      {/* faint radial glow for depth */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(0,212,255,0.25), transparent 55%), radial-gradient(circle at 75% 70%, rgba(168,85,247,0.20), transparent 55%)',
        }}
      />
      <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-2 text-xs uppercase tracking-widest text-[#A855F7]">CTN $300 → $300K</div>
        <div className="mb-1 text-2xl font-bold md:text-3xl text-white">Stream offline</div>
        <p className="mb-5 max-w-md text-sm text-white/55">
          The bot is between sessions. Catch the next live broadcast — or watch on any of the destinations below.
        </p>
        <a
          href={watchUrl}
          rel="noopener"
          className="rounded-lg bg-[#00D4FF] px-5 py-2.5 font-semibold text-black"
        >
          Open YouTube channel
        </a>
      </div>
    </div>
  )
}

function Destinations({ state }: { state: LiveState }) {
  return (
    <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
      {state.destinations.map(d => (
        <a
          key={d.platform}
          href={d.watchUrl}
          rel="noopener"
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 transition hover:border-[#00D4FF]/40 hover:bg-black/60"
        >
          <PlatformIcon platform={d.platform} />
          <span className="text-sm font-semibold text-white/90 group-hover:text-white">
            {d.label}
          </span>
        </a>
      ))}
    </div>
  )
}

function PlatformIcon({ platform }: { platform: StreamPlatform }) {
  const common = 'h-5 w-5 shrink-0'
  if (platform === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path
          fill="#FF0000"
          d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1c.4-1.9.5-3.8.5-5.8a31 31 0 0 0-.5-5.8z"
        />
        <path fill="#fff" d="M9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
      </svg>
    )
  }
  if (platform === 'twitch') {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path
          fill="#9146FF"
          d="M2.5 2.5h19v12.7l-5.4 5.4h-3.6l-2.7 2.7H7.6v-2.7H2.5V2.5zm17.2 11.8V4.3H4.3v12.7h3.6v2.7l2.7-2.7h4.5l4.6-4.7zM10.7 7.7h1.8v5.4h-1.8V7.7zm5 0h1.8v5.4h-1.8V7.7z"
        />
      </svg>
    )
  }
  if (platform === 'kick') {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path
          fill="#53FC18"
          d="M3 3h5v6h2V6h2V3h6v3h-2v3h-2v3h2v3h2v3h-6v-3h-2v-3H8v6H3V3z"
        />
      </svg>
    )
  }
  // x
  return (
    <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
      <path
        fill="#fff"
        d="M18.244 2H21l-6.51 7.43L22.5 22h-6.953l-4.86-6.337L4.872 22H2.115l6.97-7.964L1.5 2h7.083l4.394 5.81L18.244 2zm-1.22 18.176h1.937L7.083 3.74H5.005l12.018 16.435z"
      />
    </svg>
  )
}

function Footer() {
  return (
    <div className="border-t border-white/10 pt-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-1 text-xs uppercase tracking-widest text-[#FFD700]">Powered by CTN</div>
          <div className="text-sm text-white/70">
            Public <span className="text-[#10B981] font-semibold">$300 → $300K</span> challenge wallet on Orderly Network. Every trade is broadcast live.
          </div>
        </div>
        <a
          href="/magnets"
          className="inline-block rounded-lg border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-4 py-2 text-sm font-semibold text-[#00D4FF] hover:bg-[#00D4FF]/20"
        >
          See the magnets the bot is hunting →
        </a>
      </div>
      <p className="text-[11px] leading-relaxed text-white/30">
        Novex is an AI research experiment. Not financial advice. Markets are risky. Past performance is not indicative of future results.
      </p>
    </div>
  )
}
