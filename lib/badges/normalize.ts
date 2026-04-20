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
 */

export function normalizeBadges(b: unknown): string[] {
  const pushUnique = (acc: string[], v: unknown) => {
    if (typeof v === 'string' && !acc.includes(v)) acc.push(v);
    return acc;
  };

  if (Array.isArray(b)) {
    return b.reduce<string[]>(pushUnique, []);
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
