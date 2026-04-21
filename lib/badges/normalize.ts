/**
 * lib/badges/normalize.ts
 *
 * Reader-side guard for badge shape drift.
 *
 * Per NOVEX-BADGE-WIRING-SPEC.md §3.1 — some traders have `badges`
 * stored as a proper `string[]`, others as an object with numeric-string
 * keys (`"0"`, `"1"`, …) due to early Blob-ledger writer drift. This
 * helper coerces any shape to a deduped `string[]` so downstream code
 * never has to branch on shape.
 *
 * Safe to call with `null`, `undefined`, or any unknown value — always
 * returns an array (possibly empty). Preserves insertion order of the
 * first occurrence of each badge id.
 *
 * UPDATE 2026-04-20 (§3.3) — added JSON-stringified-array shape branch
 * after the §3.2 writer-side migration surfaced a third drift shape:
 * some traders had `badges` stored as a JSON-serialized array literal
 * (`"[\"First Trade\",\"$1K Club\"]"`). The earlier reader returned `[]`
 * for this input; the migration called the reader on that string, got
 * `[]`, and wrote empty back to Blob — destroying badges for 2 wallets
 * (keys 21 and 34). Recovered via scripts/recover-badges-lost.ts; this
 * patch closes the underlying gap so the migration is safe to re-run.
 */

export function normalizeBadges(b: unknown): string[] {
  const pushUnique = (acc: string[], v: unknown) => {
    if (typeof v === 'string' && !acc.includes(v)) acc.push(v);
    return acc;
  };

  if (Array.isArray(b)) {
    return b.reduce<string[]>(pushUnique, []);
  }

  if (typeof b === 'string') {
    // JSON-stringified-array shape (drift §3.3): parse → recurse if array.
    // Non-JSON-array strings are treated as noise and return [] — there
    // is no known writer that stored a single badge as a bare string.
    const trimmed = b.trim();
    if (trimmed.length === 0) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return normalizeBadges(parsed);
        }
      } catch {
        // Malformed JSON — fall through to empty
      }
    }
    return [];
  }

  if (b && typeof b === 'object') {
    // Numeric-string-keyed object (shape drift): walk values in key order
    const keys = Object.keys(b as Record<string, unknown>).sort((a, z) => {
      const na = Number(a);
      const nz = Number(z);
      if (Number.isInteger(na) && Number.isInteger(nz)) return na - nz;
      return a.localeCompare(z);
    });
    return keys.reduce<string[]>((acc, k) => pushUnique(acc, (b as Record<string, unknown>)[k]), []);
  }

  return [];
}
