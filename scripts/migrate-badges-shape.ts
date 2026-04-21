/**
 * scripts/migrate-badges-shape.ts
 *
 * One-shot writer-side migration for Badge Wiring §3.2.
 *
 * Some trader records in traders.json have `badges` as an object
 * (legacy shape: `{0: 'first_trade', 1: 'hot_streak'}`) while others have
 * the canonical array shape (`['first_trade', 'hot_streak']`). This script
 * normalizes every record to string[] so downstream mints + reads can drop
 * their defensive normalizeBadges() guards.
 *
 * Idempotent — re-running on already-clean data is a no-op.
 *
 * Run:
 *   BLOB_READ_WRITE_TOKEN=... tsx scripts/migrate-badges-shape.ts            # dry-run (default)
 *   BLOB_READ_WRITE_TOKEN=... tsx scripts/migrate-badges-shape.ts --write    # commit
 *
 * Paired with lib/badges/normalize.ts (Phase 1 shipped Apr 20 2026).
 */

import { put, list } from '@vercel/blob';
import { normalizeBadges } from '@/lib/badges/normalize';

const BLOB_PATH = 'traders.json';

type TradersBlob = Record<string, { badges?: unknown; [k: string]: unknown }>;

function dedupeSorted(badges: string[]): string[] {
  return Array.from(new Set(badges)).sort();
}

function needsMigration(v: unknown): boolean {
  // Array of strings is the target shape — anything else qualifies.
  if (Array.isArray(v) && v.every(x => typeof x === 'string')) return false;
  return true;
}

async function fetchTraders(): Promise<{ url: string; data: TradersBlob }> {
  const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
  const hit = blobs.find(b => b.pathname === BLOB_PATH);
  if (!hit) throw new Error(`blob ${BLOB_PATH} not found`);
  const res = await fetch(hit.url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetch ${BLOB_PATH} → ${res.status}`);
  const data = (await res.json()) as TradersBlob;
  return { url: hit.url, data };
}

async function main() {
  const write = process.argv.includes('--write');
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN not set — aborting.');
    process.exit(1);
  }

  console.log(`[migrate-badges-shape] mode=${write ? 'WRITE' : 'DRY-RUN'}`);
  const { url, data } = await fetchTraders();
  const wallets = Object.keys(data);
  console.log(`[migrate-badges-shape] loaded ${wallets.length} traders from ${url}`);

  let changed = 0;
  let untouched = 0;
  const samples: Array<{ wallet: string; before: unknown; after: string[] }> = [];

  for (const wallet of wallets) {
    const trader = data[wallet];
    const before = trader?.badges;
    if (!needsMigration(before)) {
      untouched++;
      continue;
    }
    const after = dedupeSorted(normalizeBadges(before));
    trader.badges = after;
    changed++;
    if (samples.length < 5) samples.push({ wallet, before, after });
  }

  console.log(`[migrate-badges-shape] changed=${changed} untouched=${untouched}`);
  if (samples.length) {
    console.log('[migrate-badges-shape] sample diffs (first 5):');
    for (const s of samples) {
      const beforeStr = JSON.stringify(s.before);
      console.log(`  ${s.wallet.slice(0, 10)}… : ${beforeStr} → [${s.after.join(', ')}]`);
    }
  }

  if (!write) {
    console.log('[migrate-badges-shape] dry-run only — pass --write to commit.');
    return;
  }
  if (changed === 0) {
    console.log('[migrate-badges-shape] nothing to write.');
    return;
  }

  const body = JSON.stringify(data, null, 2);
  await put(BLOB_PATH, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`[migrate-badges-shape] wrote ${body.length} bytes back to ${BLOB_PATH} (${changed} records migrated).`);
}

main().catch(err => {
  console.error('[migrate-badges-shape] FAILED', err);
  process.exit(1);
});
