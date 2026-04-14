'use client';

import { useQuery } from '@tanstack/react-query';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardParams {
  range?: '7D' | '30D' | '90D' | 'ALL';
  metric?: 'pnl' | 'nxp' | 'wr';
  page?: number;
}

export function useLeaderboard({ range = '30D', metric = 'pnl', page = 1 }: LeaderboardParams = {}) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', range, metric, page],
    queryFn: () =>
      fetch(`/api/leaderboard?range=${range}&metric=${metric}&page=${page}`).then((r) => {
        if (!r.ok) throw new Error('Leaderboard unavailable');
        return r.json();
      }),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
