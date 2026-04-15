// Self-destructing service worker — kills stale caches and unregisters itself.
// Drop this into public/sw.js to replace whatever old SW was cached.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  const names = await caches.keys();
  await Promise.all(names.map((n) => caches.delete(n)));
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const c of clients) c.navigate(c.url);         // hard-refresh every tab
  await self.registration.unregister();                // kill this SW
});
