'use client';

import { useQuery } from '@tanstack/react-query';
import type { EquityCurve } from '@/types';

export function useEquityCurve(range: '7D' | '30D' | '90D' = '30D') {
  return useQuery<EquityCurve>({
    queryKey: ['equity', range],
    queryFn: () =>
      fetch(`/api/equity?range=${range}`).then((r) => r.json()),
    staleTime: 60_000,
  });
}
