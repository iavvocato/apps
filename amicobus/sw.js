// Service worker di Il mio Amicobus.
// Fa una cosa sola: risponde a /amicobus/promemoria.ics?ics=<testo in base64url> con un vero file
// calendario (text/calendar), così Safari e gli altri browser propongono di aggiungerlo al calendario.
// Tutte le altre richieste passano alla rete senza modifiche: niente cache, niente copie dell'app.

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !/\/amicobus\/promemoria\.ics$/.test(url.pathname)) return;
  var dati = url.searchParams.get('ics') || '';
  var testo;
  try {
    var b64 = dati.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    testo = new TextDecoder().decode(bytes);
    if (testo.indexOf('BEGIN:VCALENDAR') !== 0) throw new Error('non è un calendario');
  } catch (e) {
    event.respondWith(new Response('Promemoria non valido.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
    return;
  }
  event.respondWith(new Response(testo, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="amicobus-promemoria.ics"'
    }
  }));
});
