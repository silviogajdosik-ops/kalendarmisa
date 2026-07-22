/**
 * service-worker.js
 * Omogućuje 100% offline rad aplikacije "Kalendar misa".
 * Strategija: cache-first, uz pozadinsko osvježavanje kad je mreža dostupna.
 *
 * VAŽNO: kad promijenite bilo koju datoteku, povećajte broj verzije prema
 * shemi opisanoj u js/verzija.js (X.Y.Z) NA OBA MJESTA: u js/verzija.js
 * (APP_VERZIJA) i ovdje u CACHE_NAME - brojevi MORAJU biti isti, inače će
 * podnožje aplikacije prikazivati krivu verziju.
 */

const CACHE_NAME = "kalendar-misa-1.8.0";

const DATOTEKE_ZA_PREDMEMORIJU = [
  "./",
  "./index.html",
  "./css/variables.css",
  "./css/layout.css",
  "./css/typography.css",
  "./css/buttons.css",
  "./css/cards.css",
  "./css/utilities.css",
  "./js/verzija.js",
  "./js/app.js",
  "./js/fixed-prayers.js",
  "./js/modules/storage.js",
  "./js/modules/calendar.js",
  "./js/modules/theme.js",
  "./js/modules/readings.js",
  "./js/modules/navigation.js",
  "./js/modules/ui.js",
  "./js/modules/service-worker-client.js",
  "./data-index.json",
  "./data-godina-A.json",
  "./data-godina-B.json",
  "./manifest.json",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // NAPOMENA: namjerno NE koristimo cache.addAll() jer on smije koristiti
      // preglednikovu HTTP predmemoriju, pa bi instalacija mogla "zamrznuti"
      // zastarjelu verziju (npr. data-godina-A.json) ako je korisnik tu datoteku
      // nedavno već dohvatio. Zato svaku datoteku dohvaćamo ručno s { cache: "reload" }
      // koje zaobilazi HTTP predmemoriju i jamči svježi mrežni dohvat pri instalaciji.
      return Promise.all(
        DATOTEKE_ZA_PREDMEMORIJU.map(function (url) {
          return fetch(url, { cache: "reload" }).then(function (odgovor) {
            return cache.put(url, odgovor);
          });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (imena) {
      return Promise.all(
        imena
          .filter(function (ime) { return ime !== CACHE_NAME; })
          .map(function (ime) { return caches.delete(ime); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function (predmemorirano) {
      var mrezniZahtjev = fetch(event.request).then(function (odgovor) {
        if (odgovor && odgovor.status === 200) {
          var kopija = odgovor.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, kopija);
          });
        }
        return odgovor;
      }).catch(function () {
        // Nema mreže - ako imamo predmemorirano, vec je vraceno ispod;
        // ako nemamo, vrati barem pocetnu stranicu za navigacijske zahtjeve.
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });

      return predmemorirano || mrezniZahtjev;
    })
  );
});
