/* Vibe Room service worker (v34). Makes the app installable and fast to load.
   It caches ONLY the static app shell (HTML, CSS, JS, images, icons). It never
   caches Socket.io, the room, or any live data — those are always network-only,
   so a room is never stale. Bump CACHE when the app shell changes. */
const CACHE = 'vibe-room-v92';
const SHELL = ['/', '/index.html', '/style.css', '/app.js', '/karaoke.js', '/extras.js', '/starmaker.js', '/qrcode.min.js', '/manifest.json', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/vinyl.jpg', '/hero-vinyl.jpg', '/gate-vibe.jpg', '/logo.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.pathname.startsWith('/socket.io/') || u.pathname.startsWith('/room/')) return; /* live — never cached */
  if (u.origin !== self.location.origin) return; /* YouTube, fonts, etc. — leave alone */
  /* v75: NETWORK-FIRST for the app code (scripts, stylesheets, navigation) so a
     pushed fix reaches the user on the very next load. The old cache-first rule
     served the stale copy for one more reload after every push, so a fix could
     sit unapplied while the user still saw the old version. The fresh copy is
     stored in the cache as it arrives, and if the network fails the cached copy
     is served instead, so offline still works. Images and icons stay
     cache-first — they never change, and cache-first is faster offline. */
  const isCode = e.request.destination === 'script' || e.request.destination === 'style' || e.request.mode === 'navigate';
  if (isCode) {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
