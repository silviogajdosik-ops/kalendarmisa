/**
 * service-worker-client.js
 * Registracija service workera (service-worker.js u korijenu projekta) +
 * automatsko osvježavanje stranice kad nova verzija preuzme kontrolu.
 *
 * NAPOMENA: ovo NIJE sam service worker (taj živi u ../../service-worker.js
 * i izvodi se u zasebnom kontekstu) - ovo je samo klijentski kod koji ga
 * registrira iz glavne stranice.
 */

export function registrirajServisniRadnik() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("service-worker.js").catch(function (err) {
      console.warn("Service worker registracija nije uspjela:", err);
    });
  });

  // Kad nova verzija service workera preuzme kontrolu (nakon što smo
  // povećali CACHE_NAME), automatski jednom osvježi stranicu. Bez ovoga
  // korisnik može ostati "zaglavljen" na staroj predmemoriranoj verziji
  // index.html (npr. sa starim viewport meta postavkama) sve dok ručno
  // ne zatvori i ponovno otvori aplikaciju.
  var vecOsvjezeno = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (vecOsvjezeno) return;
    vecOsvjezeno = true;
    window.location.reload();
  });
}
