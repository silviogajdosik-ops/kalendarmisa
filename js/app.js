/**
 * app.js
 * Glavna logika PWA "Kalendar misa".
 * Učitava data.json (promjenjivi dijelovi po danu) i STALNE_MOLITVE
 * (iz fixed-prayers.js, nepromjenjivi dijelovi) te gradi red mise.
 */

(function () {
  "use strict";

  var DANI_U_TJEDNU = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
  var MJESECI_GENITIV = [
    "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
    "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"
  ];

  var BOJA_HEX = {
    ljubicasta: "#6a3fa0",
    bijela: "#b6912a",
    crvena: "#b5333a",
    zelena: "#2f7d4f"
  };

  var svi_dani = [];
  var trenutniDan = null;
  var vjerovanjeIzbor = localStorage.getItem("vjerovanjeIzbor") || "dugo";

  var els = {
    daySelect: document.getElementById("daySelect"),
    dayTitle: document.getElementById("dayTitle"),
    dayDate: document.getElementById("dayDate"),
    dayMeta: document.getElementById("dayMeta"),
    colorDot: document.getElementById("colorDot"),
    massOrder: document.getElementById("massOrder"),
    offlineBadge: document.getElementById("offlineBadge"),
    themeColorMeta: document.getElementById("themeColorMeta")
  };

  // ---------- Pomoćne funkcije ----------

  function parsirajDatum(datumStr) {
    // datumStr format YYYY-MM-DD - parsiramo ručno da izbjegnemo probleme s vremenskom zonom
    var dijelovi = datumStr.split("-");
    return new Date(parseInt(dijelovi[0], 10), parseInt(dijelovi[1], 10) - 1, parseInt(dijelovi[2], 10));
  }

  function danasYMD() {
    var d = new Date();
    var mj = String(d.getMonth() + 1).padStart(2, "0");
    var dn = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mj + "-" + dn;
  }

  function formatDatumHR(datumStr) {
    var d = parsirajDatum(datumStr);
    var dan = DANI_U_TJEDNU[d.getDay()];
    var mjesec = MJESECI_GENITIV[d.getMonth()];
    return dan.charAt(0).toUpperCase() + dan.slice(1) + ", " + d.getDate() + ". " + mjesec + " " + d.getFullYear() + ".";
  }

  function kratkiDatum(datumStr) {
    var d = parsirajDatum(datumStr);
    return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear() + ".";
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function tekstBlok(tekst, prazniPlaceholder) {
    if (tekst && tekst.trim() !== "") {
      return '<div class="item__body">' + escapeHtml(tekst).replace(/\n/g, "<br>") + "</div>";
    }
    return '<div class="item__body empty">' + escapeHtml(prazniPlaceholder) + "</div>";
  }

  // ---------- Učitavanje podataka ----------

  function ucitajPodatke() {
    return fetch("data.json")
      .then(function (r) { return r.json(); })
      .then(function (json) {
        svi_dani = (json.dani || []).slice().sort(function (a, b) {
          return a.datum.localeCompare(b.datum);
        });
        return svi_dani;
      });
  }

  function odaberiZadaniDan() {
    var danas = danasYMD();
    for (var i = 0; i < svi_dani.length; i++) {
      if (svi_dani[i].datum >= danas) return svi_dani[i];
    }
    // Svi datumi su prošli - vrati posljednji dostupan
    return svi_dani.length ? svi_dani[svi_dani.length - 1] : null;
  }

  function popuniSelect() {
    els.daySelect.innerHTML = "";
    svi_dani.forEach(function (dan) {
      var opt = document.createElement("option");
      opt.value = dan.id;
      opt.textContent = kratkiDatum(dan.datum) + " - " + dan.naziv;
      els.daySelect.appendChild(opt);
    });
  }

  // ---------- Renderiranje ----------

  function postaviBoju(dan) {
    var hex = BOJA_HEX[dan.boja] || BOJA_HEX.zelena;
    document.documentElement.style.setProperty("--akcent", hex);
    document.documentElement.style.setProperty("--akcent-svijetla", hex + "1a");
    els.themeColorMeta.setAttribute("content", hex);
  }

  function prikaziGloriju(dan) {
    return !(dan.vrijeme === "dosasce" || dan.vrijeme === "korizma");
  }

  function aklamacijaEvandelja(dan) {
    if (dan.vrijeme === "korizma") {
      return "Slava tebi, Kriste, Kralju vječne slave.";
    }
    return "Aleluja.";
  }

  function sekcijaUvodniObredi(dan) {
    var m = STALNE_MOLITVE;
    var gloriaHtml = prikaziGloriju(dan)
      ? '<details class="item"><summary>' + m.slavaBoguNaVisini.naslov + "</summary>" +
        '<div class="item__body">' + escapeHtml(m.slavaBoguNaVisini.tekst).replace(/\n/g, "<br>") + "</div></details>"
      : '<details class="item"><summary>Slava Bogu na visini (Gloria)</summary>' +
        '<div class="item__body empty">Danas se izostavlja (nedjelja došašća ili korizme).</div></details>';

    return "" +
      '<details class="item" open><summary>' + m.znakKriza.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.znakKriza.tekst) + "</div></details>" +

      '<details class="item"><summary>' + m.pozdrav.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.pozdrav.tekst) + "</div></details>" +

      '<details class="item"><summary>' + m.cinPokoreIspovijedam.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.cinPokoreIspovijedam.tekst) + "</div>" +
      '<div class="napomena-liturgijska">Alternativa: ' + escapeHtml(m.cinPokoreKyrie.tekst) + "</div></details>" +

      gloriaHtml +

      '<details class="item"><summary>Zborna molitva</summary>' +
      '<div class="item__body empty">Zborna molitva za ovaj dan - pogledajte misal.</div></details>';
  }

  function sekcijaSluzbaRijeci(dan) {
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
      '<div class="item__body">' + escapeHtml(credoTekst) + "</div></details>" +

      '<details class="item"><summary>Molitva vjernika</summary>' + molitveVjernikaHtml + "</details>";
  }

  function sekcijaEuharistija() {
    var m = STALNE_MOLITVE;
    return "" +
      '<details class="item" open><summary>' + m.prikazanjeDarova.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.prikazanjeDarova.tekst) + "</div></details>" +

      '<details class="item"><summary>Euharistijska molitva</summary>' +
      '<div class="item__body empty">Svećenik izgovara jednu od euharistijskih molitava (kanona) - tekst ovisi o odabranom kanonu.</div></details>' +

      '<details class="item"><summary>' + m.svet.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.svet.tekst) + "</div></details>" +

      '<details class="item"><summary>' + m.otajstvoVjere.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.otajstvoVjere.tekst) + "</div></details>" +

      '<details class="item"><summary>' + m.oceNas.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.oceNas.tekst) + "</div>" +
      '<div class="napomena-liturgijska">' + escapeHtml(m.embolizam.tekst) + "</div></details>" +

      '<details class="item"><summary>' + m.znakMira.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.znakMira.tekst) + "</div></details>" +

      '<details class="item"><summary>' + m.jaganjceBozji.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.jaganjceBozji.tekst) + "</div></details>" +

      '<details class="item"><summary>Pričest</summary>' +
      '<div class="item__body">' + escapeHtml(m.pozivNaPricest.tekst) + "</div></details>";
  }

  function sekcijaZavrsniObredi() {
    var m = STALNE_MOLITVE;
    return "" +
      '<details class="item" open><summary>Obavijesti</summary>' +
      '<div class="item__body empty">Župne obavijesti - razlikuju se od dana do dana.</div></details>' +

      '<details class="item"><summary>' + m.blagoslov.naslov + "</summary>" +
      '<div class="item__body">' + escapeHtml(m.blagoslov.tekst) + "</div></details>" +

      '<details class="item"><summary>' + m.otpust.naslov + "</summary>" +
      '<div class="item__body">' +
      m.otpust.varijante.map(function (v) { return "&bull; " + escapeHtml(v); }).join("<br>") +
      '<div class="pripjev" style="margin-top:8px;">' + escapeHtml(m.otpust.odgovor) + "</div>" +
      "</div></details>";
  }

  function prikaziDan(dan) {
    trenutniDan = dan;
    postaviBoju(dan);

    els.dayTitle.textContent = dan.naziv;
    els.dayDate.textContent = formatDatumHR(dan.datum);
    var metaDijelovi = ["Godina " + dan.godinaCiklusa, dan.bojaNaziv];
    if (dan.zapovjedna) metaDijelovi.push("Zapovjedna svetkovina");
    els.dayMeta.textContent = metaDijelovi.join(" · ");
    els.colorDot.style.background = BOJA_HEX[dan.boja] || "#fff";

    els.massOrder.innerHTML = "" +
      '<details class="section" open><summary>Uvodni obredi</summary><div class="section__body">' + sekcijaUvodniObredi(dan) + "</div></details>" +
      '<details class="section"><summary>Služba riječi</summary><div class="section__body">' + sekcijaSluzbaRijeci(dan) + "</div></details>" +
      '<details class="section"><summary>Euharistijska služba</summary><div class="section__body">' + sekcijaEuharistija() + "</div></details>" +
      '<details class="section"><summary>Završni obredi</summary><div class="section__body">' + sekcijaZavrsniObredi() + "</div></details>";

    if (dan.napomena) {
      var p = document.createElement("p");
      p.className = "napomena-liturgijska";
      p.style.marginTop = "4px";
      p.textContent = dan.napomena;
      els.massOrder.appendChild(p);
    }

    // Vjerovanje toggle - delegacija dogadaja
    els.massOrder.querySelectorAll("[data-credo]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        vjerovanjeIzbor = btn.getAttribute("data-credo");
        localStorage.setItem("vjerovanjeIzbor", vjerovanjeIzbor);
        prikaziDan(trenutniDan);
      });
    });
  }

  function odaberiDanPoId(id) {
    var dan = svi_dani.find(function (d) { return d.id === id; });
    if (dan) prikaziDan(dan);
  }

  // ---------- Offline indikator ----------

  function azurirajOfflineOznaku() {
    els.offlineBadge.hidden = navigator.onLine;
  }

  // ---------- Inicijalizacija ----------

  function init() {
    ucitajPodatke().then(function () {
      popuniSelect();
      var zadani = odaberiZadaniDan();
      if (zadani) {
        els.daySelect.value = zadani.id;
        prikaziDan(zadani);
      } else {
        els.massOrder.innerHTML = '<p class="loading-msg">Nema dostupnih datuma u data.json.</p>';
      }
    }).catch(function (err) {
      els.massOrder.innerHTML = '<p class="loading-msg">Greška pri učitavanju data.json: ' + escapeHtml(err.message) + "</p>";
    });

    els.daySelect.addEventListener("change", function () {
      odaberiDanPoId(els.daySelect.value);
    });

    window.addEventListener("online", azurirajOfflineOznaku);
    window.addEventListener("offline", azurirajOfflineOznaku);
    azurirajOfflineOznaku();
  }

  document.addEventListener("DOMContentLoaded", init);

  // ---------- Service Worker registracija ----------

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function (err) {
        console.warn("Service worker registracija nije uspjela:", err);
      });
    });
  }
})();
