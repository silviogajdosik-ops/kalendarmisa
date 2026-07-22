/**
 * calendar.js
 * Datumska logika i učitavanje/odabir liturgijskih dana. Drži jedini
 * primjerak popisa svih dana (svi_dani) unutar aplikacije.
 */

export var DANI_U_TJEDNU = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
export var MJESECI_GENITIV = [
  "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
  "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"
];
export var MJESECI_NOMINATIV = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
];

var sviDani = [];

export function parsirajDatum(datumStr) {
  // datumStr format YYYY-MM-DD - parsiramo ručno da izbjegnemo probleme s vremenskom zonom
  var dijelovi = datumStr.split("-");
  return new Date(parseInt(dijelovi[0], 10), parseInt(dijelovi[1], 10) - 1, parseInt(dijelovi[2], 10));
}

export function danasYMD() {
  var d = new Date();
  var mj = String(d.getMonth() + 1).padStart(2, "0");
  var dn = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mj + "-" + dn;
}

export function formatDatumHR(datumStr) {
  var d = parsirajDatum(datumStr);
  var dan = DANI_U_TJEDNU[d.getDay()];
  var mjesec = MJESECI_GENITIV[d.getMonth()];
  return dan.charAt(0).toUpperCase() + dan.slice(1) + ", " + d.getDate() + ". " + mjesec + " " + d.getFullYear() + ".";
}

export function kratkiDatum(datumStr) {
  var d = parsirajDatum(datumStr);
  return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear() + ".";
}

// Broj cijelih dana od datuma "od" do datuma "do" (oba YYYY-MM-DD). Pozitivno
// ako je "do" u budućnosti u odnosu na "od", negativno ako je u prošlosti.
export function brojDanaIzmedju(odStr, doStr) {
  var od = parsirajDatum(odStr);
  var doDatum = parsirajDatum(doStr);
  return Math.round((doDatum - od) / 86400000);
}

export function formatMjesecNaslov(datumStr) {
  var d = parsirajDatum(datumStr);
  return MJESECI_NOMINATIV[d.getMonth()] + " " + d.getFullYear() + ".";
}

// Podaci su razdvojeni po liturgijskim godinama (data-godina-A.json, ...-B.json, ...-C.json)
// radi lakšeg ručnog uređivanja. data-index.json popisuje koje datoteke trenutno postoje -
// kad se doda nova liturgijska godina, dovoljno je dodati njezinu datoteku u taj popis.
export function ucitajPodatke() {
  return fetch("data-index.json")
    .then(function (r) { return r.json(); })
    .then(function (indeks) {
      var datoteke = (indeks && indeks.datoteke) || [];
      return Promise.all(
        datoteke.map(function (ime) {
          return fetch(ime).then(function (r) { return r.json(); });
        })
      );
    })
    .then(function (sviJsonovi) {
      var spojeno = [];
      sviJsonovi.forEach(function (json) {
        spojeno = spojeno.concat(json.dani || []);
      });
      sviDani = spojeno.sort(function (a, b) {
        return a.datum.localeCompare(b.datum);
      });
      return sviDani;
    });
}

export function getSviDani() {
  return sviDani;
}

export function odaberiZadaniDan() {
  var danas = danasYMD();
  for (var i = 0; i < sviDani.length; i++) {
    if (sviDani[i].datum >= danas) return sviDani[i];
  }
  // Svi datumi su prošli - vrati posljednji dostupan
  return sviDani.length ? sviDani[sviDani.length - 1] : null;
}
