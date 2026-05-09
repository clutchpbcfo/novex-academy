-- 0002_runtime_kv.sql
-- Small key/value table for runtime caches that need to be SHARED across Vercel
-- function instances. v1 use: 5-minute throttle on YouTube Data API search.list
-- calls (quota = 100/day at 100 units per call).
--
-- Apply: wrangler d1 execute novex_magnets --file=db/migrations/0002_runtime_kv.sql
-- Or via CF MCP: d1_database_query against db id 525fd65e-52be-4ce9-ad56-ecbd68bc6f40.

CREATE TABLE IF NOT EXISTS magnets_runtime_kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
