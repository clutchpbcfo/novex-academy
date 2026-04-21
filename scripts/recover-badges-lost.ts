import { put, list } from '@vercel/blob';
const BLOB_PATH = 'traders.json';
const RESTORE: Record<string, string[]> = {
  '21': ['First Trade', '$1K Club', '$10K Club', '$100K Club'],
  '34': ['First Trade', '$1K Club', '$10K Club', 'Profitable Trader', '$100K Club'],
};
async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) { console.error('no token'); process.exit(1); }
  const write = process.argv.includes('--write');
  const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
  const hit = blobs.find(b => b.pathname === BLOB_PATH);
  if (!hit) throw new Error('blob not found');
  const res = await fetch(hit.url, { cache: 'no-store' });
  const data = (await res.json()) as Record<string, any>;
  console.log('[recover] mode=' + (write ? 'WRITE' : 'DRY-RUN') + ' loaded ' + Object.keys(data).length + ' traders');
  let patched = 0;
  for (const [key, badges] of Object.entries(RESTORE)) {
    if (!data[key]) { console.warn('  MISSING key ' + key + ' — skip'); continue; }
    const before = data[key].badges;
    if (Array.isArray(before) && before.length > 0) {
      console.warn('  key ' + key + ' already has badges ' + JSON.stringify(before) + ' — skip (safety)');
      continue;
    }
    console.log('  ' + key + ' before: ' + JSON.stringify(before));
    data[key].badges = badges;
    console.log('  ' + key + ' after : ' + JSON.stringify(badges));
    patched++;
  }
  if (!write) { console.log('[recover] dry-run. patched-in-memory=' + patched + '. pass --write to commit.'); return; }
  if (patched === 0) { console.log('[recover] nothing to write.'); return; }
  const body = JSON.stringify(data, null, 2);
  await put(BLOB_PATH, body, { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true });
  console.log('[recover] RESTORED ' + patched + ' records (' + body.length + ' bytes)');
}
main().catch(e => { console.error('[recover] FAILED', e); process.exit(1); });
