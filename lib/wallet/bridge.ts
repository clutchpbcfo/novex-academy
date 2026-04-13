'use client';

export function broadcastSession(): void {
  if (typeof window === 'undefined') return;
  const ch = new BroadcastChannel('novex-session');
  ch.postMessage({ type: 'refresh' });
  ch.close();
}

export function subscribeToSessionChanges(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const ch = new BroadcastChannel('novex-session');
  ch.onmessage = (e: MessageEvent) => {
    if (e.data.type === 'refresh') cb();
  };
  return () => ch.close();
}
