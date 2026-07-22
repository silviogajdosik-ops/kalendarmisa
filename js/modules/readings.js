/**
 * readings.js
 * Gradi HTML sadržaj sekcija reda mise (uvodni obredi, služba riječi,
 * euharistijska služba, završni obredi) iz podataka za dan + STALNE_MOLITVE.
 *
 * NAPOMENA: STALNE_MOLITVE je globalna varijabla koju postavlja
 * js/fixed-prayers.js - klasična <script> datoteka učitana PRIJE ovog
 * modula (vidi redoslijed <script> oznaka u index.html), pa je dostupna
 * ovdje kao obična globalna referenca.
 */

export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function tekstBlok(tekst, prazniPlaceholder) {
  if (tekst && tekst.trim() !== "") {
    return '<div class="item__body">' + escapeHtml(tekst).replace(/\n/g, "<br>") + "</div>";
  }
  return '<div class="item__body empty">' + escapeHtml(prazniPlaceholder) + "</div>";
}

// Gradi <details class="item"> za jednostavan unos iz STALNE_MOLITVE (samo
// naslov + tekst, bez dodatnog sadržaja) - ponavljajući uzorak koji se
// koristi za većinu stalnih molitava u sve 4 sekcije reda mise.
export function fiksnaStavka(molitva, otvorena) {
  return '<details class="item"' + (otvorena ? " open" : "") + "><summary>" + molitva.naslov + "</summary>" +
    '<div class="item__body">' + escapeHtml(molitva.tekst) + "</div></details>";
}

export function prikaziGloriju(dan) {
  return !(dan.vrijeme === "dosasce" || dan.vrijeme === "korizma");
}

export function aklamacijaEvandelja(dan) {
  if (dan.vrijeme === "korizma") {
    return "Slava tebi, Kriste, Kralju vječne slave.";
  }
  return "Aleluja.";
}

export function sekcijaUvodniObredi(dan) {
  var m = STALNE_MOLITVE;
  var gloriaHtml = prikaziGloriju(dan)
    ? fiksnaStavka(m.slavaBoguNaVisini, false)
    : '<details class="item"><summary>Slava Bogu na visini (Gloria)</summary>' +
      '<div class="item__body empty">Danas se izostavlja (nedjelja došašća ili korizme).</div></details>';

  return "" +
    fiksnaStavka(m.znakKriza, true) +

    fiksnaStavka(m.pozdrav, false) +

    '<details class="item"><summary>' + m.cinPokoreIspovijedam.naslov + "</summary>" +
    '<div class="item__body">' + escapeHtml(m.cinPokoreIspovijedam.tekst) + "</div>" +
    '<div class="napomena-liturgijska">Alternativa: ' + escapeHtml(m.cinPokoreKyrie.tekst) + "</div></details>" +

    gloriaHtml +

    '<details class="item"><summary>Zborna molitva</summary>' +
    '<div class="item__body empty">Zborna molitva za ovaj dan - pogledajte misal.</div></details>';
}

export function sekcijaSluzbaRijeci(dan, vjerovanjeIzbor) {
  var c = dan.citanja || {};
  var prvo = c.prvo || {};
  var psalam = c.psalam || {};
  var drugo = c.drugo || {};
  var evandelje = c.evandelje || {};
  var m = STALNE_MOLITVE;

  var refHtml = function (ref) {
    return ref ? '<span class="item__ref">' + escapeHtml(ref) + "</span>" : "";
  };

  var psalamTekst = "";
  if (psalam.tekst && psalam.tekst.trim() !== "") {
    psalamTekst = '<div class="item__body">' +
      (psalam.pripjev ? '<div class="pripjev">' + escapeHtml(psalam.pripjev) + "</div>" : "") +
      escapeHtml(psalam.tekst).replace(/\n/g, "<br>") + "</div>";
  } else {
    psalamTekst = '<div class="item__body empty">' +
      (psalam.pripjev ? '<div class="pripjev">' + escapeHtml(psalam.pripjev) + "</div>" : "") +
      "Tekst psalma još nije unesen." + "</div>";
  }

  var molitveVjernikaHtml;
  if (dan.molitvaVjernika && dan.molitvaVjernika.length) {
    molitveVjernikaHtml = '<ul class="molitva-lista">' +
      dan.molitvaVjernika.map(function (m2) { return "<li>" + escapeHtml(m2) + "</li>"; }).join("") +
      "</ul>";
  } else {
    molitveVjernikaHtml = '<div class="item__body empty">Nakane molitve vjernika još nisu unesene za ovaj dan.</div>';
  }

  var credoTekst = vjerovanjeIzbor === "kratko" ? m.vjerovanjeKratko.tekst : m.vjerovanjeDugo.tekst;

  return "" +
    '<details class="item" open><summary>1. čitanje ' + refHtml(prvo.referenca) + "</summary>" +
    (prvo.naslov ? '<div class="napomena-liturgijska">' + escapeHtml(prvo.naslov) + "</div>" : "") +
    tekstBlok(prvo.tekst, "Tekst prvog čitanja još nije unesen.") + "</details>" +

    '<details class="item"><summary>Otpjevni psalam ' + refHtml(psalam.referenca) + "</summary>" + psalamTekst + "</details>" +

    '<details class="item"><summary>2. čitanje ' + refHtml(drugo.referenca) + "</summary>" +
    (drugo.naslov ? '<div class="napomena-liturgijska">' + escapeHtml(drugo.naslov) + "</div>" : "") +
    tekstBlok(drugo.tekst, "Tekst drugog čitanja još nije unesen.") + "</details>" +

    '<details class="item"><summary>Evanđelje ' + refHtml(evandelje.referenca) + "</summary>" +
    '<div class="pripjev">' + escapeHtml(aklamacijaEvandelja(dan)) + "</div>" +
    (evandelje.naslov ? '<div class="napomena-liturgijska">' + escapeHtml(evandelje.naslov) + "</div>" : "") +
    tekstBlok(evandelje.tekst, "Tekst evanđelja još nije unesen.") + "</details>" +

    '<details class="item"><summary>Homilija</summary>' +
    '<div class="item__body empty">Osobne bilješke uz propovijed.</div></details>' +

    '<details class="item"><summary>Vjerovanje</summary>' +
    '<div class="credo-toggle">' +
    '<button type="button" data-credo="dugo" class="' + (vjerovanjeIzbor === "dugo" ? "active" : "") + '">Dugo (Nicejsko-carigradsko)</button>' +
    '<button type="button" data-credo="kratko" class="' + (vjerovanjeIzbor === "kratko" ? "active" : "") + '">Kratko (Apostolsko)</button>' +
    "</div>" +
    '<div class="item__body" id="credoTekst">' + escapeHtml(credoTekst) + "</div></details>" +

    '<details class="item"><summary>Molitva vjernika</summary>' + molitveVjernikaHtml + "</details>";
}

export function sekcijaEuharistija() {
  var m = STALNE_MOLITVE;
  return "" +
    fiksnaStavka(m.prikazanjeDarova, true) +

    '<details class="item"><summary>Euharistijska molitva</summary>' +
    '<div class="item__body empty">Svećenik izgovara jednu od euharistijskih molitava (kanona) - tekst ovisi o odabranom kanonu.</div></details>' +

    fiksnaStavka(m.svet, false) +

    fiksnaStavka(m.otajstvoVjere, false) +

    '<details class="item"><summary>' + m.oceNas.naslov + "</summary>" +
    '<div class="item__body">' + escapeHtml(m.oceNas.tekst) + "</div>" +
    '<div class="napomena-liturgijska">' + escapeHtml(m.embolizam.tekst) + "</div></details>" +

    fiksnaStavka(m.znakMira, false) +

    fiksnaStavka(m.jaganjceBozji, false) +

    '<details class="item"><summary>Pričest</summary>' +
    '<div class="item__body">' + escapeHtml(m.pozivNaPricest.tekst) + "</div></details>";
}

export function sekcijaZavrsniObredi() {
  var m = STALNE_MOLITVE;
  return "" +
    '<details class="item" open><summary>Obavijesti</summary>' +
    '<div class="item__body empty">Župne obavijesti - razlikuju se od dana do dana.</div></details>' +

    fiksnaStavka(m.blagoslov, false) +

    '<details class="item"><summary>' + m.otpust.naslov + "</summary>" +
    '<div class="item__body">' +
    m.otpust.varijante.map(function (v) { return "&bull; " + escapeHtml(v); }).join("<br>") +
    '<div class="pripjev" style="margin-top:8px;">' + escapeHtml(m.otpust.odgovor) + "</div>" +
    "</div></details>";
}
