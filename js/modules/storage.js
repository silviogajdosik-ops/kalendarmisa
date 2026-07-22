/**
 * storage.js
 * Centralizira sve pristupe localStorage-u (spremljene korisničke postavke:
 * veličina fonta, izbor vjerovanja, "način mise", Wake Lock, tema). Ostali
 * moduli čitaju/pišu te postavke isključivo preko ovih funkcija, nikad
 * izravno preko localStorage-a - da je svako ime ključa definirano na
 * jednom mjestu.
 */

export var FONT_KORACI = [15, 17, 19, 21]; // px: mali, normalan (zadano), velik, najveći
export var FONT_ZADANI_INDEKS = 1;

export function ucitajFontIndeks() {
  var i = parseInt(localStorage.getItem("fontIndeks"), 10);
  if (isNaN(i) || i < 0 || i >= FONT_KORACI.length) return FONT_ZADANI_INDEKS;
  return i;
}
export function spremiFontIndeks(i) {
  localStorage.setItem("fontIndeks", String(i));
}
export function imaSpremljeniFontIndeks() {
  return localStorage.getItem("fontIndeks") !== null;
}

export function ucitajVjerovanjeIzbor() {
  return localStorage.getItem("vjerovanjeIzbor") || "dugo";
}
export function spremiVjerovanjeIzbor(v) {
  localStorage.setItem("vjerovanjeIzbor", v);
}

export function ucitajNacinMise() {
  return localStorage.getItem("nacinMise") === "1";
}
export function spremiNacinMise(aktivno) {
  localStorage.setItem("nacinMise", aktivno ? "1" : "0");
}

export function ucitajZeljenoBudnoStanje() {
  var v = localStorage.getItem("budnoZeljeno");
  return v === null ? "1" : v; // zadano: ekran ostaje budan
}
export function spremiZeljenoBudnoStanje(v) {
  localStorage.setItem("budnoZeljeno", v);
}

// Tema se čita iz atributa na <html> (koji inline skripta u <head> već
// postavlja prije prvog crtanja stranice), ne izravno iz localStorage-a.
export function ucitajTemaIzbor() {
  return document.documentElement.getAttribute("data-tema") || "svijetla";
}
export function spremiTemaIzbor(t) {
  localStorage.setItem("temaIzbor", t);
}
