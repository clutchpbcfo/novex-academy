'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeToSessionChanges } from '@/lib/wallet/bridge';
import { useWalletStore } from '@/lib/state/use-wallet-store';
import type { Session } from '@/types';

export function useSession() {
  const queryClient = useQueryClient();
  const setSession = useWalletStore((s) => s.setSession);

  const query = useQuery<Session | null>({
    queryKey: ['session'],
    queryFn: () =>
      fetch('/api/session').then((r) => (r.ok ? r.json() : null)),
    staleTime: 30_000,
  });

  // Sync to Zustand store
  useEffect(() => {
    setSession(query.data ?? null);
  }, [query.data, setSession]);

  // Cross-tab sync via BroadcastChannel
  useEffect(() => {
    return subscribeToSessionChanges(() => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    });
  }, [queryClient]);

  return query;
}
