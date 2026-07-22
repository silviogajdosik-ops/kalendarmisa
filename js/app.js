/**
 * app.js
 * Ulazna točka PWA "Kalendar misa" - ES modul koji sastavlja module iz
 * js/modules/ (calendar, theme, readings, storage, navigation, ui,
 * service-worker-client) i povezuje ih s DOM-om konkretne stranice
 * (dohvat elemenata, event listeneri, prikaziDan - glavna renderirajuća
 * funkcija). Učitava data-index.json/data-godina-*.json (promjenjivi
 * dijelovi po danu) i STALNE_MOLITVE (iz fixed-prayers.js, nepromjenjivi
 * dijelovi) te gradi red mise.
 */

import * as calendar from "./modules/calendar.js";
import * as tema from "./modules/theme.js";
import * as readings from "./modules/readings.js";
import * as storage from "./modules/storage.js";
import * as navigation from "./modules/navigation.js";
import * as ui from "./modules/ui.js";
import * as swKlijent from "./modules/service-worker-client.js";

var trenutniDan = null;
var vjerovanjeIzbor = storage.ucitajVjerovanjeIzbor();
var nacinMiseAktivan = storage.ucitajNacinMise();

var els = {
  prevDanBtn: document.getElementById("prevDanBtn"),
  nextDanBtn: document.getElementById("nextDanBtn"),
  danasBtn: document.getElementById("danasBtn"),
  dayInfo: document.getElementById("dayInfo"),
  dayTitle: document.getElementById("dayTitle"),
  dayBadge: document.getElementById("dayBadge"),
  dayDate: document.getElementById("dayDate"),
  dayMeta: document.getElementById("dayMeta"),
  colorDot: document.getElementById("colorDot"),
  massOrder: document.getElementById("massOrder"),
  offlineBadge: document.getElementById("offlineBadge"),
  themeColorMeta: document.getElementById("themeColorMeta"),
  temaToggle: document.getElementById("temaToggle"),
  fontManji: document.getElementById("fontManji"),
  fontVeci: document.getElementById("fontVeci"),
  wakeLockToggle: document.getElementById("wakeLockToggle"),
  expiryBanner: document.getElementById("expiryBanner"),
  nacinMiseCheckbox: document.getElementById("nacinMiseCheckbox"),
  dayModalBackdrop: document.getElementById("dayModalBackdrop"),
  dayModal: document.getElementById("dayModal"),
  dayModalClose: document.getElementById("dayModalClose"),
  dayModalList: document.getElementById("dayModalList")
};

// ---------- Boja teme za trenutni dan ----------

function postaviBoju(dan) {
  var hex = tema.hexPozadine(dan);
  document.documentElement.style.setProperty("--akcent", hex);
  document.documentElement.style.setProperty("--akcent-svijetla", hex + "1a");

  var hexTekst = tema.hexTeksta(dan);
  document.documentElement.style.setProperty("--akcent-tekst", hexTekst);

  els.themeColorMeta.setAttribute("content", hex);
}

// ---------- Banner isteka podataka + značka dana ----------

// Banner na vrhu stranice: crveni ako je zadnji dan u podacima već prošao
// (aplikacija bi inače tiho pokazivala zadnji dostupan dan), žuti kao najava
// 30 dana prije tog isteka. Poziva se jednom nakon učitavanja podataka jer se
// raspon podataka ne mijenja tijekom rada aplikacije.
function azurirajBannerIsteka() {
  var sviDani = calendar.getSviDani();
  if (!els.expiryBanner || !sviDani.length) return;
  var zadnji = sviDani[sviDani.length - 1];
  var danas = calendar.danasYMD();
  var zadnjiFormatiran = calendar.kratkiDatum(zadnji.datum);

  if (danas > zadnji.datum) {
    els.expiryBanner.hidden = false;
    els.expiryBanner.className = "expiry-banner expiry-banner--expired";
    els.expiryBanner.textContent =
      "Podaci pokrivaju razdoblje do " + zadnjiFormatiran + " - potrebno je ažuriranje aplikacije.";
    return;
  }

  var danaDoIsteka = calendar.brojDanaIzmedju(danas, zadnji.datum);
  if (danaDoIsteka <= 30) {
    els.expiryBanner.hidden = false;
    els.expiryBanner.className = "expiry-banner expiry-banner--soon";
    els.expiryBanner.textContent =
      "Podaci pokrivaju razdoblje do " + zadnjiFormatiran +
      " - uskoro će biti potrebno ažuriranje aplikacije (još " + danaDoIsteka + " dana).";
    return;
  }

  els.expiryBanner.hidden = true;
  els.expiryBanner.textContent = "";
}

// Badge "DANAS" / "za N dana" / "prije N dana" u day-info traci - korisnik koji
// otvori aplikaciju npr. u srijedu odmah vidi zašto se prikazuje nedjelja.
function azurirajOznakuDana(dan) {
  if (!els.dayBadge) return;
  var diff = calendar.brojDanaIzmedju(calendar.danasYMD(), dan.datum);
  els.dayBadge.classList.remove("day-badge--danas", "day-badge--nadolazece", "day-badge--proslo");
  els.dayBadge.hidden = false;

  if (diff === 0) {
    els.dayBadge.textContent = "DANAS";
    els.dayBadge.classList.add("day-badge--danas");
  } else if (diff > 0) {
    els.dayBadge.textContent = diff === 1 ? "sutra" : "za " + diff + " dana";
    els.dayBadge.classList.add("day-badge--nadolazece");
  } else {
    var proslo = -diff;
    els.dayBadge.textContent = proslo === 1 ? "jučer" : "prije " + proslo + " dana";
    els.dayBadge.classList.add("day-badge--proslo");
  }
}

// ---------- Renderiranje dana ----------

function prikaziDan(dan, vrstaAnimacije) {
  trenutniDan = dan;
  postaviBoju(dan);

  els.dayTitle.textContent = dan.naziv;
  azurirajOznakuDana(dan);
  els.dayDate.textContent = calendar.formatDatumHR(dan.datum);
  var metaDijelovi = ["Godina " + dan.godinaCiklusa, dan.bojaNaziv];
  if (dan.zapovjedna) metaDijelovi.push("Zapovjedna svetkovina");
  els.dayMeta.textContent = metaDijelovi.join(" · ");
  els.colorDot.style.background = tema.hexPozadine(dan);

  els.massOrder.innerHTML = "" +
    ui.sekcijaWrapper("uvodni", "Uvodni obredi", false, readings.sekcijaUvodniObredi(dan)) +
    ui.sekcijaWrapper("rijec", "Služba riječi", true, readings.sekcijaSluzbaRijeci(dan, vjerovanjeIzbor)) +
    ui.sekcijaWrapper("euharistija", "Euharistijska služba", false, readings.sekcijaEuharistija()) +
    ui.sekcijaWrapper("zavrsni", "Završni obredi", false, readings.sekcijaZavrsniObredi());

  // "Način mise": sekcija koja je otvorena po zadanome (Služba riječi - najčešće
  // potreban sadržaj tijekom mise) odmah dobiva sve svoje stavke raširene,
  // bez čekanja na ručni klik/toggle.
  if (nacinMiseAktivan) {
    ui.rasiriSveStavke(els.massOrder.querySelector("details.section[open]"));
  }

  // Skrolaj na vrh sadržaja i primijeni suptilnu animaciju samo kad je ovo
  // stvarna promjena dana (swipe/odabir/gumb "Danas"), ne kod prvog učitavanja.
  if (vrstaAnimacije) {
    var reduciranoKretanje = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduciranoKretanje ? "auto" : "smooth" });

    var animKlase = ["mass-order--anim-next", "mass-order--anim-prev", "mass-order--anim-fade"];
    els.massOrder.classList.remove.apply(els.massOrder.classList, animKlase);
    void els.massOrder.offsetWidth; // forsiraj reflow da se animacija ponovno pokrene
    els.massOrder.classList.add("mass-order--anim-" + vrstaAnimacije);
  }

  if (dan.napomena) {
    var p = document.createElement("p");
    p.className = "napomena-liturgijska";
    p.style.marginTop = "4px";
    p.textContent = dan.napomena;
    els.massOrder.appendChild(p);
  }

  // Vjerovanje toggle - delegacija dogadaja
  // NAPOMENA: ne zovemo prikaziDan() ponovno ovdje jer bi to iznova izgradilo
  // cijeli massOrder.innerHTML i time zatvorilo (saželo) sve otvorene <details>
  // harmonike na stranici. Umjesto toga samo ažuriramo tekst vjerovanja i
  // aktivni gumb na mjestu (in place), bez dirati ostatak DOM-a.
  els.massOrder.querySelectorAll("[data-credo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      vjerovanjeIzbor = btn.getAttribute("data-credo");
      storage.spremiVjerovanjeIzbor(vjerovanjeIzbor);

      els.massOrder.querySelectorAll("[data-credo]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-credo") === vjerovanjeIzbor);
      });

      var credoDiv = document.getElementById("credoTekst");
      if (credoDiv) {
        var noviTekst = vjerovanjeIzbor === "kratko"
          ? STALNE_MOLITVE.vjerovanjeKratko.tekst
          : STALNE_MOLITVE.vjerovanjeDugo.tekst;
        credoDiv.textContent = noviTekst;
      }
    });
  });
}

function odaberiDanPoId(id) {
  var dan = calendar.getSviDani().find(function (d) { return d.id === id; });
  if (dan) prikaziDan(dan, "fade");
}

function idiNaDanasnjiDan() {
  var zadani = calendar.odaberiZadaniDan();
  if (zadani) prikaziDan(zadani, "fade");
}

function idiNaSusjedniDan(smjer) {
  var novi = navigation.susjedniDan(trenutniDan, smjer);
  if (!novi) return; // već smo na prvom/zadnjem danu
  prikaziDan(novi, smjer > 0 ? "next" : "prev");
}

// ---------- Otvori sve / Zatvori sve (po sekciji) + "Način mise" ----------

// Delegacija klika na "Otvori sve"/"Zatvori sve" gumb bilo koje sekcije.
// massOrder.innerHTML se mijenja pri svakoj promjeni dana, ali sam element
// #massOrder ostaje isti, pa je jedan listener ovdje dovoljan za sve buduće
// prikaze (ne treba ga ponovno vezati u prikaziDan()).
function inicijalizirajKontroleSekcija() {
  els.massOrder.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-section-toggle]");
    if (!btn) return;
    var sekcijaEl = btn.closest("details.section");
    if (!sekcijaEl) return;
    var otvoriti = btn.textContent.trim() === "Otvori sve";
    sekcijaEl.querySelectorAll("details.item").forEach(function (d) { d.open = otvoriti; });
    btn.textContent = otvoriti ? "Zatvori sve" : "Otvori sve";
  });
}

// "Način mise": kad je uključen, svaka sekcija koju korisnik otvori u crkvi
// odmah dobiva sve svoje stavke raširene (bez otvaranja stavku-po-stavku).
// <details> event "toggle" ne bubbla u nekim preglednicima, zato se listener
// veže s capture=true na predak - to i dalje radi za delegaciju jer capture
// faza prolazi kroz sve potomke bez obzira na bubbling potomka.
function inicijalizirajNacinMiseListener() {
  els.massOrder.addEventListener("toggle", function (e) {
    if (!nacinMiseAktivan) return;
    var el = e.target;
    if (el && el.matches && el.matches("details.section") && el.open) {
      ui.rasiriSveStavke(el);
    }
  }, true);
}

function postaviNacinMise(aktivno) {
  nacinMiseAktivan = aktivno;
  storage.spremiNacinMise(aktivno);
  if (els.nacinMiseCheckbox) els.nacinMiseCheckbox.checked = aktivno;
  if (aktivno) {
    ui.rasiriSveStavke(els.massOrder.querySelector("details.section[open]"));
  }
}

// ---------- Inicijalizacija ----------

function init() {
  ui.primijeniIkonuTeme(els.temaToggle, tema.getTemaIzbor());
  if (els.temaToggle) {
    els.temaToggle.addEventListener("click", function () {
      tema.postaviTemu(tema.getTemaIzbor() === "tamna" ? "svijetla" : "tamna");
      ui.primijeniIkonuTeme(els.temaToggle, tema.getTemaIzbor());
      // Boja teksta (--akcent-tekst) ovisi o temi (svjetlija nijansa u tamnoj temi
      // radi WCAG AA kontrasta) - osvježi je za trenutno prikazani dan.
      if (trenutniDan) postaviBoju(trenutniDan);
    });
  }

  // Veličina fonta - gumbi A- / A+. Ne zovemo primijeniVelicinuFonta() ovdje
  // (osim ako korisnik već ima spremljeni izbor) da ne pregazimo CSS media-query
  // zadanu responzivnu veličinu za nove korisnike bez spremljene postavke.
  ui.azurirajGumbeFonta(els);
  if (ui.imaSpremljeniFontIndeks()) {
    ui.primijeniVelicinuFonta(els);
  }
  if (els.fontManji) {
    els.fontManji.addEventListener("click", function () { ui.postaviVelicinuFonta(els, ui.getFontIndeks() - 1); });
  }
  if (els.fontVeci) {
    els.fontVeci.addEventListener("click", function () { ui.postaviVelicinuFonta(els, ui.getFontIndeks() + 1); });
  }

  // Wake Lock - drži ekran budnim tijekom mise, uz uredan fallback.
  if (els.wakeLockToggle) {
    if (!ui.jeWakeLockPodrzan()) {
      els.wakeLockToggle.hidden = true;
    } else {
      els.wakeLockToggle.hidden = false;
      ui.azurirajIkonuWakeLock(els.wakeLockToggle);
      els.wakeLockToggle.addEventListener("click", function () {
        ui.postaviWakeLockIzbor(els.wakeLockToggle, ui.getZeljenoBudnoStanje() !== "1");
      });
      ui.zatraziWakeLock();
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
          ui.zatraziWakeLock();
        }
      });
    }
  }

  if (els.danasBtn) {
    els.danasBtn.addEventListener("click", idiNaDanasnjiDan);
  }
  if (els.prevDanBtn) {
    els.prevDanBtn.addEventListener("click", function () { idiNaSusjedniDan(-1); });
  }
  if (els.nextDanBtn) {
    els.nextDanBtn.addEventListener("click", function () { idiNaSusjedniDan(1); });
  }
  if (els.dayInfo) {
    els.dayInfo.addEventListener("click", function () {
      navigation.otvoriIzbornikDana(els, trenutniDan, function (id) {
        navigation.zatvoriIzbornikDana(els);
        odaberiDanPoId(id);
      });
    });
  }
  if (els.dayModalClose) {
    els.dayModalClose.addEventListener("click", function () { navigation.zatvoriIzbornikDana(els); });
  }

  navigation.inicijalizirajSwipe(els.massOrder, idiNaSusjedniDan);
  inicijalizirajKontroleSekcija();
  inicijalizirajNacinMiseListener();

  if (els.nacinMiseCheckbox) {
    els.nacinMiseCheckbox.checked = nacinMiseAktivan;
    els.nacinMiseCheckbox.addEventListener("change", function () {
      postaviNacinMise(els.nacinMiseCheckbox.checked);
    });
  }

  calendar.ucitajPodatke().then(function () {
    azurirajBannerIsteka();
    var zadani = calendar.odaberiZadaniDan();
    if (zadani) {
      prikaziDan(zadani);
    } else {
      els.massOrder.innerHTML =
        '<p class="loading-msg">Trenutno nema dostupnih dana za prikaz. ' +
        "Pokušajte ponovno pokrenuti aplikaciju ili provjerite je li instalirana najnovija verzija.</p>";
    }
  }).catch(function (err) {
    els.massOrder.innerHTML =
      '<p class="loading-msg">Nismo uspjeli učitati podatke. Provjerite internetsku vezu i pokušajte ponovno.' +
      '<br><span class="loading-msg__detalj">(' + readings.escapeHtml(err.message) + ")</span></p>";
  });

  window.addEventListener("online", function () { ui.azurirajOfflineOznaku(els.offlineBadge); });
  window.addEventListener("offline", function () { ui.azurirajOfflineOznaku(els.offlineBadge); });
  ui.azurirajOfflineOznaku(els.offlineBadge);
}

document.addEventListener("DOMContentLoaded", init);

// ---------- Prikaz verzije aplikacije u podnožju ----------

document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("appVerzija");
  if (el && typeof APP_VERZIJA !== "undefined") {
    el.textContent = "Verzija " + APP_VERZIJA;
  }
});

// ---------- Service Worker registracija ----------

swKlijent.registrirajServisniRadnik();
