/**
 * ui.js
 * Generički sitni UI dijelovi koji nisu specifični za jedan dan: ikone
 * (SVG), veličina fonta, Wake Lock (drži ekran budnim), harmonika
 * sekcija/stavki (otvori/zatvori sve) i offline značka.
 */

import {
  FONT_KORACI,
  ucitajFontIndeks,
  spremiFontIndeks,
  imaSpremljeniFontIndeks,
  ucitajZeljenoBudnoStanje,
  spremiZeljenoBudnoStanje
} from "./storage.js";

export var IKONA_MJESEC = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
export var IKONA_SUNCE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>';
export var IKONA_OKO = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
export var IKONA_OKO_PREKRIZENO = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';

// ---------- Tema (ikona gumba) ----------

export function primijeniIkonuTeme(temaToggleEl, temaIzbor) {
  if (!temaToggleEl) return;
  temaToggleEl.innerHTML = temaIzbor === "tamna" ? IKONA_SUNCE : IKONA_MJESEC;
  temaToggleEl.setAttribute(
    "aria-label",
    temaIzbor === "tamna" ? "Uključi svijetlu temu" : "Uključi tamnu temu"
  );
}

// ---------- Veličina fonta ----------

var fontIndeks = ucitajFontIndeks();

export function getFontIndeks() {
  return fontIndeks;
}

export { imaSpremljeniFontIndeks };

export function azurirajGumbeFonta(els) {
  if (els.fontManji) els.fontManji.disabled = fontIndeks === 0;
  if (els.fontVeci) els.fontVeci.disabled = fontIndeks === FONT_KORACI.length - 1;
}

export function primijeniVelicinuFonta(els) {
  document.documentElement.style.fontSize = FONT_KORACI[fontIndeks] + "px";
  azurirajGumbeFonta(els);
}

export function postaviVelicinuFonta(els, noviIndeks) {
  fontIndeks = Math.max(0, Math.min(FONT_KORACI.length - 1, noviIndeks));
  spremiFontIndeks(fontIndeks);
  primijeniVelicinuFonta(els);
}

// ---------- Wake Lock (ekran se ne gasi tijekom mise) ----------

var WAKE_LOCK_PODRZAN = "wakeLock" in navigator;
var zeljenoBudnoStanje = ucitajZeljenoBudnoStanje();
var trenutniWakeLock = null;

export function jeWakeLockPodrzan() {
  return WAKE_LOCK_PODRZAN;
}

export function getZeljenoBudnoStanje() {
  return zeljenoBudnoStanje;
}

export function azurirajIkonuWakeLock(wakeLockToggleEl) {
  if (!wakeLockToggleEl) return;
  var aktivno = zeljenoBudnoStanje === "1";
  wakeLockToggleEl.innerHTML = aktivno ? IKONA_OKO : IKONA_OKO_PREKRIZENO;
  wakeLockToggleEl.classList.toggle("wake-toggle--iskljuceno", !aktivno);
  wakeLockToggleEl.setAttribute("aria-pressed", aktivno ? "true" : "false");
  wakeLockToggleEl.setAttribute(
    "aria-label",
    aktivno ? "Isključi držanje ekrana budnim" : "Uključi držanje ekrana budnim"
  );
}

export function zatraziWakeLock() {
  if (!WAKE_LOCK_PODRZAN || zeljenoBudnoStanje !== "1") return;
  navigator.wakeLock.request("screen").then(function (lock) {
    trenutniWakeLock = lock;
    lock.addEventListener("release", function () {
      trenutniWakeLock = null;
    });
  }).catch(function (err) {
    // Uredan fallback: ako zahtjev ne uspije (npr. preglednik odbije jer
    // stranica nije vidljiva), samo zabilježi u konzolu - aplikacija
    // normalno radi dalje i bez Wake Locka.
    console.warn("Wake Lock zahtjev nije uspio:", err);
  });
}

export function otpustiWakeLock() {
  if (trenutniWakeLock) {
    trenutniWakeLock.release().catch(function () {});
    trenutniWakeLock = null;
  }
}

export function postaviWakeLockIzbor(wakeLockToggleEl, ukljuceno) {
  zeljenoBudnoStanje = ukljuceno ? "1" : "0";
  spremiZeljenoBudnoStanje(zeljenoBudnoStanje);
  azurirajIkonuWakeLock(wakeLockToggleEl);
  if (ukljuceno) {
    zatraziWakeLock();
  } else {
    otpustiWakeLock();
  }
}

// ---------- Harmonika sekcija/stavki ----------

// Omotava sadržaj sekcije u <details class="section"> uz kontrolnu traku
// "Otvori sve / Zatvori sve" (data-section-toggle).
export function sekcijaWrapper(id, naslov, otvorena, sadrzajHtml) {
  return '<details class="section" data-section-id="' + id + '"' + (otvorena ? " open" : "") + ">" +
    "<summary>" + naslov + "</summary>" +
    '<div class="section__body">' +
    '<div class="section-controls"><button type="button" class="section-controls__btn" data-section-toggle="' + id + '">Otvori sve</button></div>' +
    sadrzajHtml +
    "</div></details>";
}

// Otvara sve <details class="item"> unutar zadane sekcije i ažurira njezin
// "Otvori sve/Zatvori sve" gumb - koristi ga i ručni klik i "Način mise".
export function rasiriSveStavke(sekcijaEl) {
  if (!sekcijaEl) return;
  sekcijaEl.querySelectorAll("details.item").forEach(function (d) { d.open = true; });
  var btn = sekcijaEl.querySelector("[data-section-toggle]");
  if (btn) btn.textContent = "Zatvori sve";
}

// ---------- Offline indikator ----------

export function azurirajOfflineOznaku(offlineBadgeEl) {
  offlineBadgeEl.hidden = navigator.onLine;
}
