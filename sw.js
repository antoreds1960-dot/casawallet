// Service worker di CasaWallet.
// Serve a due cose: (1) mostrare le notifiche su Android, dove i siti web non possono
// crearle direttamente; (2) tenere una copia delle risorse per l'uso offline.
// Questo file deve stare nella STESSA cartella di index.html.
const CACHE = 'casawallet-v1';

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// Rete per prima (così vedi sempre la versione aggiornata), copia in cache come ripiego offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || Response.error()))
  );
});

// Tocco sulla notifica: riporta in primo piano l'app (o la apre).
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow('./');
  }));
});
