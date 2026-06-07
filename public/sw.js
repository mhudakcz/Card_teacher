// Service worker pro Card Teacher — jednoduchá offline podpora.
// Strategie: stale-while-revalidate pro statické soubory, navigace s fallbackem na app shell.
// Vite generuje hashované názvy souborů, takže místo statického seznamu cachujeme za běhu.

const CACHE = 'card-teacher-v1';
// scope končí lomítkem (např. "/Card_teacher/"); app shell je index.html v kořeni scope.
const SHELL = new URL('./', self.registration.scope).pathname;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // cizí původy neřešíme

  // SPA navigace → zkus síť, jinak vrať uložený app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(SHELL, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match(SHELL)) || (await cache.match(req)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Statické soubory: stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })(),
  );
});
