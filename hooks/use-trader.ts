'use client';

import { useQuery } from '@tanstack/react-query';
import type { BlobTrader } from '@/types';

export function useTrader(wallet: string | null | undefined) {
  return useQuery<BlobTrader | null>({
    queryKey: ['trader', wallet],
    queryFn: async () => {
      if (!wallet) return null;
      const r = await fetch(`/api/trader?wallet=${encodeURIComponent(wallet)}`);
      if (!r.ok) return null;
      const data = await r.json();
      // API returns null if not found, or error object on failure
      if (data && typeof data === 'object' && 'error' in data) return null;
      return data as BlobTrader | null;
    },
    enabled: Boolean(wallet),
    staleTime: 5 * 60 * 1000,
  });
}
