/**
 * theme.js
 * Stanje svijetle/tamne teme + tablice liturgijskih boja (pozadina i tekst).
 * Ovaj modul ne dira DOM osim atributa data-tema na <html> - ažuriranje
 * ikone gumba i CSS custom properties za trenutni dan rade pozivatelji
 * (js/app.js) koristeći ove funkcije kao izvor podataka.
 */

import { ucitajTemaIzbor, spremiTemaIzbor } from "./storage.js";

// Boje za POZADINE (zaglavlje, aktivni gumbi) - uvijek uz bijeli tekst,
// zato moraju biti dovoljno tamne za WCAG AA kontrast (>=4.5:1) s bijelom.
// "bijela" (zlatna) liturgijska boja je namjerno potamnjena s izvorne #b6912a
// (kontrast s bijelom bio je samo ~2.97:1, ne prolazi AA) na #8a6d16 (~4.9:1).
export var BOJA_HEX = {
  ljubicasta: "#6a3fa0",
  bijela: "#8a6d16",
  crvena: "#b5333a",
  zelena: "#2f7d4f"
};

// Boje za TEKST (naslovi sekcija, pripjev) na podlozi stranice (--pozadina).
// Razlikuju se po temi jer se ista boja mora čitati i na bijeloj i na tamnoj
// podlozi - u tamnoj temi koriste se svjetlije inačice da kontrast ostane >=4.5:1.
export var BOJA_HEX_TEKST = {
  // Svijetla tema koristi iste nijanse kao pozadine (BOJA_HEX) - nema
  // zasebne definicije da se izbjegne dupliciranje istih hex vrijednosti.
  svijetla: BOJA_HEX,
  tamna: {
    ljubicasta: "#b699e8",
    bijela: "#caa04a",
    crvena: "#e8747a",
    zelena: "#6fc48f"
  }
};

var temaIzbor = ucitajTemaIzbor();

export function getTemaIzbor() {
  return temaIzbor;
}

export function postaviTemu(nova) {
  temaIzbor = nova;
  document.documentElement.setAttribute("data-tema", temaIzbor);
  spremiTemaIzbor(temaIzbor);
}

export function hexPozadine(dan) {
  return BOJA_HEX[dan.boja] || BOJA_HEX.zelena;
}

export function hexTeksta(dan) {
  var tablica = BOJA_HEX_TEKST[temaIzbor] || BOJA_HEX_TEKST.svijetla;
  return tablica[dan.boja] || tablica.zelena;
}
