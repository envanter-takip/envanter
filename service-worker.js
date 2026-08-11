/* Teknik Envanter - Service Worker
   Bu uygulama canlı/çok kullanıcılı bir sistem olduğu için veriler
   ASLA önbelleğe alınmaz. Sadece uygulamanın "kabuğu" (ikon, manifest)
   önbelleklenir, böylece PWA olarak hızlı açılır ve ana ekran ikonu çalışır.
   index.html her zaman ağdan (Supabase bağlantısı için) taze çekilir. */

const CACHE_ADI = 'envanter-kabuk-v1';
const KABUK_DOSYALARI = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_ADI).then(function(cache) {
      return cache.addAll(KABUK_DOSYALARI);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(isimler) {
      return Promise.all(
        isimler.filter(function(isim) { return isim !== CACHE_ADI; })
               .map(function(isim) { return caches.delete(isim); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  /* index.html ve tüm API/Supabase istekleri: HER ZAMAN ağdan çek (asla önbellek). */
  if (event.request.method !== 'GET' || url.indexOf('supabase.co') !== -1) {
    return; /* tarayıcının normal davranışına bırak */
  }

  /* Sadece ikon/manifest gibi statik kabuk dosyaları için: önce ağ, olmazsa önbellek */
  if (KABUK_DOSYALARI.some(function(f) { return url.indexOf(f.replace('./','')) !== -1; })) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
  }
});
