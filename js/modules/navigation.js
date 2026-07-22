/**
 * navigation.js
 * Prelazak između dana (prethodni/sljedeći/swipe) + izbornik dana
 * (modal/bottom-sheet zamjena za stari <select> sa 110+ ravnih stavki).
 *
 * Ovaj modul namjerno ne zna ništa o prikaziDan() (renderiranje sadržaja
 * dana) - poziva se preko callbacka "onOdabir"/"onSwipe" koje mu predaje
 * js/app.js, čime se izbjegava kružna ovisnost između modula.
 */

import { getSviDani, odaberiZadaniDan, formatMjesecNaslov, kratkiDatum } from "./calendar.js";
import { hexPozadine } from "./theme.js";

export function indeksTrenutnogDana(trenutniDan) {
  var dani = getSviDani();
  if (!trenutniDan) return -1;
  for (var i = 0; i < dani.length; i++) {
    if (dani[i].id === trenutniDan.id) return i;
  }
  return -1;
}

// Vraća susjedni dan (smjer +1 = sljedeći, -1 = prethodni) ili null ako
// smo već na prvom/zadnjem danu ili trenutni dan nije poznat.
export function susjedniDan(trenutniDan, smjer) {
  var dani = getSviDani();
  var i = indeksTrenutnogDana(trenutniDan);
  if (i === -1) return null;
  var novi = i + smjer;
  if (novi < 0 || novi >= dani.length) return null;
  return dani[novi];
}

// ---------- Swipe lijevo/desno ----------

export function inicijalizirajSwipe(massOrderEl, onSwipe) {
  var pocetakX = null;
  var pocetakY = null;
  var PRAG_UDALJENOSTI = 60; // px, minimalan vodoravni pomak da se prepozna swipe
  var PRAG_OMJERA = 1.5; // vodoravni pomak mora biti barem ovoliko puta veći od okomitog
  var RUB_MRTVE_ZONE = 24; // px - dodiri koji krenu ovoliko blizu ruba ekrana se ignoriraju,
  // da se izbjegne sudar s sistemskom gestom "natrag" (edge-swipe) na iOS/Androidu.

  massOrderEl.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    var x = e.touches[0].clientX;
    if (x < RUB_MRTVE_ZONE || x > window.innerWidth - RUB_MRTVE_ZONE) {
      pocetakX = null; // prepusti dodir sistemskoj gesti, ne pratimo ga
      return;
    }
    pocetakX = x;
    pocetakY = e.touches[0].clientY;
  }, { passive: true });

  massOrderEl.addEventListener("touchend", function (e) {
    if (pocetakX === null) return;
    var dodir = e.changedTouches[0];
    var dx = dodir.clientX - pocetakX;
    var dy = dodir.clientY - pocetakY;
    pocetakX = null;
    pocetakY = null;

    if (Math.abs(dx) >= PRAG_UDALJENOSTI && Math.abs(dx) >= Math.abs(dy) * PRAG_OMJERA) {
      onSwipe(dx < 0 ? 1 : -1); // lijevo = sljedeći dan, desno = prethodni dan
    }
  }, { passive: true });
}

// ---------- Izbornik dana (modal / bottom-sheet) ----------

var zadnjiFokusPrijeModala = null;
var aktivniEls = null;

function napraviStavkuIzbornika(dan, zadaniDan, trenutniId, onOdabir) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "day-modal__item";
  if (dan.id === zadaniDan.id) btn.classList.add("day-modal__item--danas");
  btn.setAttribute("data-day-id", dan.id);

  var tocka = document.createElement("span");
  tocka.className = "day-modal__item-dot";
  tocka.style.background = hexPozadine(dan);

  var tekst = document.createElement("span");
  tekst.className = "day-modal__item-text";

  var naziv = document.createElement("span");
  naziv.className = "day-modal__item-naziv";
  naziv.textContent = dan.naziv;

  var meta = document.createElement("span");
  meta.className = "day-modal__item-meta";
  meta.textContent = kratkiDatum(dan.datum) + (dan.zapovjedna ? " · Zapovjedna svetkovina" : "");

  tekst.appendChild(naziv);
  tekst.appendChild(meta);
  btn.appendChild(tocka);
  btn.appendChild(tekst);

  if (dan.id === trenutniId) {
    var kvacica = document.createElement("span");
    kvacica.className = "day-modal__item-check";
    kvacica.setAttribute("aria-hidden", "true");
    kvacica.textContent = "✓";
    btn.appendChild(kvacica);
    btn.setAttribute("aria-current", "true");
  }

  btn.addEventListener("click", function () {
    onOdabir(dan.id);
  });

  return btn;
}

function dodajStavkeGrupiranePoMjesecu(spremnik, dani, zadaniDan, trenutniId, onOdabir) {
  var trenutniNaslovMjeseca = null;
  dani.forEach(function (dan) {
    var naslovMjeseca = formatMjesecNaslov(dan.datum);
    if (naslovMjeseca !== trenutniNaslovMjeseca) {
      trenutniNaslovMjeseca = naslovMjeseca;
      var naslovEl = document.createElement("div");
      naslovEl.className = "day-modal__month";
      naslovEl.textContent = naslovMjeseca;
      spremnik.appendChild(naslovEl);
    }
    spremnik.appendChild(napraviStavkuIzbornika(dan, zadaniDan, trenutniId, onOdabir));
  });
}

// Gradi sadržaj izbornika iznova pri SVAKOM otvaranju (prošli dani uvijek
// počinju sklopljeni - "zadano se vidi samo od danas nadalje").
function izgradiPopisDanaZaIzbornik(dayModalListEl, trenutniDan, onOdabir) {
  dayModalListEl.innerHTML = "";
  var sviDani = getSviDani();
  if (!sviDani.length) {
    dayModalListEl.innerHTML = '<p class="day-modal__empty">Nema dostupnih dana za prikaz.</p>';
    return;
  }

  var zadaniDan = odaberiZadaniDan();
  var indeksZadanog = sviDani.findIndex(function (d) { return d.id === zadaniDan.id; });
  if (indeksZadanog === -1) indeksZadanog = 0;
  var trenutniId = trenutniDan ? trenutniDan.id : null;

  var prosli = sviDani.slice(0, indeksZadanog);
  var ostali = sviDani.slice(indeksZadanog);

  if (prosli.length) {
    var prosliSpremnik = document.createElement("div");
    prosliSpremnik.className = "day-modal__prosli";
    prosliSpremnik.hidden = true;
    dodajStavkeGrupiranePoMjesecu(prosliSpremnik, prosli, zadaniDan, trenutniId, onOdabir);

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "day-modal__past-toggle";
    toggle.textContent = "Prikaži prošle dane (" + prosli.length + ")";
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var otvaraSe = prosliSpremnik.hidden;
      // Sadržaj se ubacuje IZNAD trenutne scroll pozicije, pa bez korekcije
      // scrollTop-a stavke koje korisnik gleda "skoče" gore/dolje na ekranu.
      var visinaPrije = prosliSpremnik.hidden ? 0 : prosliSpremnik.offsetHeight;
      prosliSpremnik.hidden = !otvaraSe;
      var visinaPoslije = prosliSpremnik.hidden ? 0 : prosliSpremnik.offsetHeight;
      dayModalListEl.scrollTop += (visinaPoslije - visinaPrije);
      toggle.setAttribute("aria-expanded", otvaraSe ? "true" : "false");
      toggle.textContent = otvaraSe
        ? "Sakrij prošle dane"
        : "Prikaži prošle dane (" + prosli.length + ")";
    });

    dayModalListEl.appendChild(toggle);
    dayModalListEl.appendChild(prosliSpremnik);
  }

  dodajStavkeGrupiranePoMjesecu(dayModalListEl, ostali, zadaniDan, trenutniId, onOdabir);
}

function obradiKlikIzvanPanela(e) {
  if (e.target === aktivniEls.dayModalBackdrop) zatvoriIzbornikDana(aktivniEls);
}

function obradiTipkuModala(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    zatvoriIzbornikDana(aktivniEls);
    return;
  }
  if (e.key === "Tab") {
    var fokusabilni = aktivniEls.dayModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!fokusabilni.length) return;
    var prvi = fokusabilni[0];
    var zadnji = fokusabilni[fokusabilni.length - 1];
    if (e.shiftKey && document.activeElement === prvi) {
      e.preventDefault();
      zadnji.focus();
    } else if (!e.shiftKey && document.activeElement === zadnji) {
      e.preventDefault();
      prvi.focus();
    }
  }
}

// els = { dayModalBackdrop, dayModal, dayModalClose, dayModalList, dayInfo }
// onOdabir(dayId) - poziva se kad korisnik klikne na jedan dan u popisu.
export function otvoriIzbornikDana(els, trenutniDan, onOdabir) {
  if (!els.dayModalBackdrop) return;
  aktivniEls = els;
  izgradiPopisDanaZaIzbornik(els.dayModalList, trenutniDan, onOdabir);
  zadnjiFokusPrijeModala = document.activeElement;

  els.dayModalBackdrop.hidden = false;
  void els.dayModal.offsetWidth; // forsiraj reflow da tranzicija otvaranja stvarno krene
  els.dayModalBackdrop.classList.add("otvoren");
  document.body.classList.add("modal-otvoren");

  var ciljanaStavka = els.dayModalList.querySelector(".day-modal__item--danas");
  if (ciljanaStavka) ciljanaStavka.scrollIntoView({ block: "center" });

  if (els.dayModalClose) els.dayModalClose.focus();
  document.addEventListener("keydown", obradiTipkuModala);
  els.dayModalBackdrop.addEventListener("click", obradiKlikIzvanPanela);
}

export function zatvoriIzbornikDana(els) {
  if (!els || !els.dayModalBackdrop) return;
  els.dayModalBackdrop.classList.remove("otvoren");
  document.body.classList.remove("modal-otvoren");
  document.removeEventListener("keydown", obradiTipkuModala);
  els.dayModalBackdrop.removeEventListener("click", obradiKlikIzvanPanela);

  var reduciranoKretanje = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sakrij = function () { els.dayModalBackdrop.hidden = true; };
  if (reduciranoKretanje) {
    sakrij();
  } else {
    setTimeout(sakrij, 280); // uskladi s trajanjem CSS tranzicije .day-modal
  }

  if (zadnjiFokusPrijeModala && typeof zadnjiFokusPrijeModala.focus === "function") {
    zadnjiFokusPrijeModala.focus();
  } else if (els.dayInfo) {
    els.dayInfo.focus();
  }
}
