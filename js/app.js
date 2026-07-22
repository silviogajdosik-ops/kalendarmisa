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
  var MJESECI_NOMINATIV = [
    "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
    "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
  ];

  // Boje za POZADINE (zaglavlje, aktivni gumbi) - uvijek uz bijeli tekst,
  // zato moraju biti dovoljno tamne za WCAG AA kontrast (>=4.5:1) s bijelom.
  // "bijela" (zlatna) liturgijska boja je namjerno potamnjena s izvorne #b6912a
  // (kontrast s bijelom bio je samo ~2.97:1, ne prolazi AA) na #8a6d16 (~4.9:1).
  var BOJA_HEX = {
    ljubicasta: "#6a3fa0",
    bijela: "#8a6d16",
    crvena: "#b5333a",
    zelena: "#2f7d4f"
  };

  // Boje za TEKST (naslovi sekcija, pripjev) na podlozi stranice (--pozadina).
  // Razlikuju se po temi jer se ista boja mora čitati i na bijeloj i na tamnoj
  // podlozi - u tamnoj temi koriste se svjetlije inačice da kontrast ostane >=4.5:1.
  var BOJA_HEX_TEKST = {
    svijetla: {
      ljubicasta: "#6a3fa0",
      bijela: "#8a6d16",
      crvena: "#b5333a",
      zelena: "#2f7d4f"
    },
    tamna: {
      ljubicasta: "#b699e8",
      bijela: "#caa04a",
      crvena: "#e8747a",
      zelena: "#6fc48f"
    }
  };

  var IKONA_MJESEC = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var IKONA_SUNCE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>';
  var IKONA_OKO = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  var IKONA_OKO_PREKRIZENO = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';

  var svi_dani = [];
  var trenutniDan = null;
  var vjerovanjeIzbor = localStorage.getItem("vjerovanjeIzbor") || "dugo";
  var temaIzbor = document.documentElement.getAttribute("data-tema") || "svijetla";
  var nacinMiseAktivan = localStorage.getItem("nacinMise") === "1";

  var FONT_KORACI = [15, 17, 19, 21]; // px: mali, normalan (zadano), velik, najveći
  var FONT_ZADANI_INDEKS = 1;
  var fontIndeks = parseInt(localStorage.getItem("fontIndeks"), 10);
  if (isNaN(fontIndeks) || fontIndeks < 0 || fontIndeks >= FONT_KORACI.length) {
    fontIndeks = FONT_ZADANI_INDEKS;
  }

  var WAKE_LOCK_PODRZAN = "wakeLock" in navigator;
  var zeljenoBudnoStanje = localStorage.getItem("budnoZeljeno");
  if (zeljenoBudnoStanje === null) zeljenoBudnoStanje = "1"; // zadano: ekran ostaje budan
  var trenutniWakeLock = null;

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

  // ---------- Tema (svijetla/tamna) ----------

  function primijeniIkonuTeme() {
    if (!els.temaToggle) return;
    els.temaToggle.innerHTML = temaIzbor === "tamna" ? IKONA_SUNCE : IKONA_MJESEC;
    els.temaToggle.setAttribute(
      "aria-label",
      temaIzbor === "tamna" ? "Uključi svijetlu temu" : "Uključi tamnu temu"
    );
  }

  function postaviTemu(nova) {
    temaIzbor = nova;
    document.documentElement.setAttribute("data-tema", temaIzbor);
    localStorage.setItem("temaIzbor", temaIzbor);
    primijeniIkonuTeme();
    // Boja teksta (--akcent-tekst) ovisi o temi (svjetlija nijansa u tamnoj temi
    // radi WCAG AA kontrasta) - osvježi je za trenutno prikazani dan.
    if (trenutniDan) postaviBoju(trenutniDan);
  }

  // ---------- Veličina fonta ----------

  function azurirajGumbeFonta() {
    if (els.fontManji) els.fontManji.disabled = fontIndeks === 0;
    if (els.fontVeci) els.fontVeci.disabled = fontIndeks === FONT_KORACI.length - 1;
  }

  function primijeniVelicinuFonta() {
    document.documentElement.style.fontSize = FONT_KORACI[fontIndeks] + "px";
    azurirajGumbeFonta();
  }

  function postaviVelicinuFonta(noviIndeks) {
    fontIndeks = Math.max(0, Math.min(FONT_KORACI.length - 1, noviIndeks));
    localStorage.setItem("fontIndeks", String(fontIndeks));
    primijeniVelicinuFonta();
  }

  // ---------- Wake Lock (ekran se ne gasi tijekom mise) ----------

  function azurirajIkonuWakeLock() {
    if (!els.wakeLockToggle) return;
    var aktivno = zeljenoBudnoStanje === "1";
    els.wakeLockToggle.innerHTML = aktivno ? IKONA_OKO : IKONA_OKO_PREKRIZENO;
    els.wakeLockToggle.classList.toggle("wake-toggle--iskljuceno", !aktivno);
    els.wakeLockToggle.setAttribute("aria-pressed", aktivno ? "true" : "false");
    els.wakeLockToggle.setAttribute(
      "aria-label",
      aktivno ? "Isključi držanje ekrana budnim" : "Uključi držanje ekrana budnim"
    );
  }

  function zatraziWakeLock() {
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

  function otpustiWakeLock() {
    if (trenutniWakeLock) {
      trenutniWakeLock.release().catch(function () {});
      trenutniWakeLock = null;
    }
  }

  function postaviWakeLockIzbor(ukljuceno) {
    zeljenoBudnoStanje = ukljuceno ? "1" : "0";
    localStorage.setItem("budnoZeljeno", zeljenoBudnoStanje);
    azurirajIkonuWakeLock();
    if (ukljuceno) {
      zatraziWakeLock();
    } else {
      otpustiWakeLock();
    }
  }

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

  // Broj cijelih dana od datuma "od" do datuma "do" (oba YYYY-MM-DD). Pozitivno
  // ako je "do" u budućnosti u odnosu na "od", negativno ako je u prošlosti.
  function brojDanaIzmedju(odStr, doStr) {
    var od = parsirajDatum(odStr);
    var doDatum = parsirajDatum(doStr);
    return Math.round((doDatum - od) / 86400000);
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

  // Podaci su razdvojeni po liturgijskim godinama (data-godina-A.json, ...-B.json, ...-C.json)
  // radi lakšeg ručnog uređivanja. data-index.json popisuje koje datoteke trenutno postoje -
  // kad se doda nova liturgijska godina, dovoljno je dodati njezinu datoteku u taj popis.
  function ucitajPodatke() {
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
        svi_dani = spojeno.sort(function (a, b) {
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

  function formatMjesecNaslov(datumStr) {
    var d = parsirajDatum(datumStr);
    return MJESECI_NOMINATIV[d.getMonth()] + " " + d.getFullYear() + ".";
  }

  // Banner na vrhu stranice: crveni ako je zadnji dan u podacima već prošao
  // (aplikacija bi inače tiho pokazivala zadnji dostupan dan), žuti kao najava
  // 30 dana prije tog isteka. Poziva se jednom nakon učitavanja podataka jer se
  // raspon podataka ne mijenja tijekom rada aplikacije.
  function azurirajBannerIsteka() {
    if (!els.expiryBanner || !svi_dani.length) return;
    var zadnji = svi_dani[svi_dani.length - 1];
    var danas = danasYMD();
    var zadnjiFormatiran = kratkiDatum(zadnji.datum);

    if (danas > zadnji.datum) {
      els.expiryBanner.hidden = false;
      els.expiryBanner.className = "expiry-banner expiry-banner--expired";
      els.expiryBanner.textContent =
        "Podaci pokrivaju razdoblje do " + zadnjiFormatiran + " - potrebno je ažuriranje aplikacije.";
      return;
    }

    var danaDoIsteka = brojDanaIzmedju(danas, zadnji.datum);
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
    var diff = brojDanaIzmedju(danasYMD(), dan.datum);
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

  // ---------- Renderiranje ----------

  function postaviBoju(dan) {
    var hex = BOJA_HEX[dan.boja] || BOJA_HEX.zelena;
    document.documentElement.style.setProperty("--akcent", hex);
    document.documentElement.style.setProperty("--akcent-svijetla", hex + "1a");

    var tablicaTeksta = BOJA_HEX_TEKST[temaIzbor] || BOJA_HEX_TEKST.svijetla;
    var hexTekst = tablicaTeksta[dan.boja] || tablicaTeksta.zelena;
    document.documentElement.style.setProperty("--akcent-tekst", hexTekst);

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
      '<div class="item__body" id="credoTekst">' + escapeHtml(credoTekst) + "</div></details>" +

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

  // Omotava sadržaj sekcije u <details class="section"> uz kontrolnu traku
  // "Otvori sve / Zatvori sve" (data-section-toggle) - vidi inicijalizirajKontroleSekcija().
  function sekcijaWrapper(id, naslov, otvorena, sadrzajHtml) {
    return '<details class="section" data-section-id="' + id + '"' + (otvorena ? " open" : "") + ">" +
      "<summary>" + naslov + "</summary>" +
      '<div class="section__body">' +
      '<div class="section-controls"><button type="button" class="section-controls__btn" data-section-toggle="' + id + '">Otvori sve</button></div>' +
      sadrzajHtml +
      "</div></details>";
  }

  // Otvara sve <details class="item"> unutar zadane sekcije i ažurira njezin
  // "Otvori sve/Zatvori sve" gumb - koristi ga i ručni klik i "Način mise".
  function rasiriSveStavke(sekcijaEl) {
    if (!sekcijaEl) return;
    sekcijaEl.querySelectorAll("details.item").forEach(function (d) { d.open = true; });
    var btn = sekcijaEl.querySelector("[data-section-toggle]");
    if (btn) btn.textContent = "Zatvori sve";
  }

  function prikaziDan(dan, vrstaAnimacije) {
    trenutniDan = dan;
    postaviBoju(dan);

    els.dayTitle.textContent = dan.naziv;
    azurirajOznakuDana(dan);
    els.dayDate.textContent = formatDatumHR(dan.datum);
    var metaDijelovi = ["Godina " + dan.godinaCiklusa, dan.bojaNaziv];
    if (dan.zapovjedna) metaDijelovi.push("Zapovjedna svetkovina");
    els.dayMeta.textContent = metaDijelovi.join(" · ");
    els.colorDot.style.background = BOJA_HEX[dan.boja] || "#fff";

    els.massOrder.innerHTML = "" +
      sekcijaWrapper("uvodni", "Uvodni obredi", false, sekcijaUvodniObredi(dan)) +
      sekcijaWrapper("rijec", "Služba riječi", true, sekcijaSluzbaRijeci(dan)) +
      sekcijaWrapper("euharistija", "Euharistijska služba", false, sekcijaEuharistija()) +
      sekcijaWrapper("zavrsni", "Završni obredi", false, sekcijaZavrsniObredi());

    // "Način mise": sekcija koja je otvorena po zadanome (Služba riječi - najčešće
    // potreban sadržaj tijekom mise) odmah dobiva sve svoje stavke raširene,
    // bez čekanja na ručni klik/toggle.
    if (nacinMiseAktivan) {
      rasiriSveStavke(els.massOrder.querySelector("details.section[open]"));
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
        localStorage.setItem("vjerovanjeIzbor", vjerovanjeIzbor);

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
    var dan = svi_dani.find(function (d) { return d.id === id; });
    if (dan) prikaziDan(dan, "fade");
  }

  function idiNaDanasnjiDan() {
    var zadani = odaberiZadaniDan();
    if (zadani) prikaziDan(zadani, "fade");
  }

  // ---------- Swipe lijevo/desno (prethodni/sljedeći dan) ----------

  function indeksTrenutnogDana() {
    if (!trenutniDan) return -1;
    for (var i = 0; i < svi_dani.length; i++) {
      if (svi_dani[i].id === trenutniDan.id) return i;
    }
    return -1;
  }

  function idiNaSusjedniDan(smjer) {
    var i = indeksTrenutnogDana();
    if (i === -1) return;
    var novi = i + smjer;
    if (novi < 0 || novi >= svi_dani.length) return; // već smo na prvom/zadnjem danu
    prikaziDan(svi_dani[novi], smjer > 0 ? "next" : "prev");
  }

  // ---------- Izbornik dana (modal / bottom-sheet) ----------
  // Zamjena za stari <select> sa 110+ ravnih stavki: dodir na day-info traku
  // otvara full-screen/bottom-sheet izbornik grupiran po mjesecima, s prošlim
  // danima sklopljenim iza jedne stavke (zadano se vidi samo od danas nadalje).

  var zadnjiFokusPrijeModala = null;

  function napraviStavkuIzbornika(dan, zadaniDan, trenutniId) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day-modal__item";
    if (dan.id === zadaniDan.id) btn.classList.add("day-modal__item--danas");
    btn.setAttribute("data-day-id", dan.id);

    var tocka = document.createElement("span");
    tocka.className = "day-modal__item-dot";
    tocka.style.background = BOJA_HEX[dan.boja] || BOJA_HEX.zelena;

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
      zatvoriIzbornikDana();
      odaberiDanPoId(dan.id);
    });

    return btn;
  }

  function dodajStavkeGrupiranePoMjesecu(spremnik, dani, zadaniDan, trenutniId) {
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
      spremnik.appendChild(napraviStavkuIzbornika(dan, zadaniDan, trenutniId));
    });
  }

  // Gradi sadržaj izbornika iznova pri SVAKOM otvaranju (prošli dani uvijek
  // počinju sklopljeni - "zadano se vidi samo od danas nadalje").
  function izgradiPopisDanaZaIzbornik() {
    els.dayModalList.innerHTML = "";
    if (!svi_dani.length) {
      els.dayModalList.innerHTML = '<p class="day-modal__empty">Nema dostupnih dana za prikaz.</p>';
      return;
    }

    var zadaniDan = odaberiZadaniDan();
    var indeksZadanog = svi_dani.findIndex(function (d) { return d.id === zadaniDan.id; });
    if (indeksZadanog === -1) indeksZadanog = 0;
    var trenutniId = trenutniDan ? trenutniDan.id : null;

    var prosli = svi_dani.slice(0, indeksZadanog);
    var ostali = svi_dani.slice(indeksZadanog);

    if (prosli.length) {
      var prosliSpremnik = document.createElement("div");
      prosliSpremnik.className = "day-modal__prosli";
      prosliSpremnik.hidden = true;
      dodajStavkeGrupiranePoMjesecu(prosliSpremnik, prosli, zadaniDan, trenutniId);

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
        els.dayModalList.scrollTop += (visinaPoslije - visinaPrije);
        toggle.setAttribute("aria-expanded", otvaraSe ? "true" : "false");
        toggle.textContent = otvaraSe
          ? "Sakrij prošle dane"
          : "Prikaži prošle dane (" + prosli.length + ")";
      });

      els.dayModalList.appendChild(toggle);
      els.dayModalList.appendChild(prosliSpremnik);
    }

    dodajStavkeGrupiranePoMjesecu(els.dayModalList, ostali, zadaniDan, trenutniId);
  }

  function obradiKlikIzvanPanela(e) {
    if (e.target === els.dayModalBackdrop) zatvoriIzbornikDana();
  }

  function obradiTipkuModala(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      zatvoriIzbornikDana();
      return;
    }
    if (e.key === "Tab") {
      var fokusabilni = els.dayModal.querySelectorAll(
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

  function otvoriIzbornikDana() {
    if (!els.dayModalBackdrop) return;
    izgradiPopisDanaZaIzbornik();
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

  function zatvoriIzbornikDana() {
    if (!els.dayModalBackdrop) return;
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

  function inicijalizirajSwipe() {
    var pocetakX = null;
    var pocetakY = null;
    var PRAG_UDALJENOSTI = 60; // px, minimalan vodoravni pomak da se prepozna swipe
    var PRAG_OMJERA = 1.5; // vodoravni pomak mora biti barem ovoliko puta veći od okomitog
    var RUB_MRTVE_ZONE = 24; // px - dodiri koji krenu ovoliko blizu ruba ekrana se ignoriraju,
    // da se izbjegne sudar s sistemskom gestom "natrag" (edge-swipe) na iOS/Androidu.

    els.massOrder.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      var x = e.touches[0].clientX;
      if (x < RUB_MRTVE_ZONE || x > window.innerWidth - RUB_MRTVE_ZONE) {
        pocetakX = null; // prepusti dodir sistemskoj gesti, ne pratimo ga
        return;
      }
      pocetakX = x;
      pocetakY = e.touches[0].clientY;
    }, { passive: true });

    els.massOrder.addEventListener("touchend", function (e) {
      if (pocetakX === null) return;
      var dodir = e.changedTouches[0];
      var dx = dodir.clientX - pocetakX;
      var dy = dodir.clientY - pocetakY;
      pocetakX = null;
      pocetakY = null;

      if (Math.abs(dx) >= PRAG_UDALJENOSTI && Math.abs(dx) >= Math.abs(dy) * PRAG_OMJERA) {
        idiNaSusjedniDan(dx < 0 ? 1 : -1); // lijevo = sljedeći dan, desno = prethodni dan
      }
    }, { passive: true });
  }

  // ---------- Offline indikator ----------

  function azurirajOfflineOznaku() {
    els.offlineBadge.hidden = navigator.onLine;
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
        rasiriSveStavke(el);
      }
    }, true);
  }

  function postaviNacinMise(aktivno) {
    nacinMiseAktivan = aktivno;
    localStorage.setItem("nacinMise", aktivno ? "1" : "0");
    if (els.nacinMiseCheckbox) els.nacinMiseCheckbox.checked = aktivno;
    if (aktivno) {
      rasiriSveStavke(els.massOrder.querySelector("details.section[open]"));
    }
  }

  // ---------- Inicijalizacija ----------

  function init() {
    primijeniIkonuTeme();
    if (els.temaToggle) {
      els.temaToggle.addEventListener("click", function () {
        postaviTemu(temaIzbor === "tamna" ? "svijetla" : "tamna");
      });
    }

    // Veličina fonta - gumbi A- / A+. Ne zovemo primijeniVelicinuFonta() ovdje
    // (osim ako korisnik već ima spremljeni izbor) da ne pregazimo CSS media-query
    // zadanu responzivnu veličinu za nove korisnike bez spremljene postavke.
    azurirajGumbeFonta();
    if (localStorage.getItem("fontIndeks") !== null) {
      primijeniVelicinuFonta();
    }
    if (els.fontManji) {
      els.fontManji.addEventListener("click", function () { postaviVelicinuFonta(fontIndeks - 1); });
    }
    if (els.fontVeci) {
      els.fontVeci.addEventListener("click", function () { postaviVelicinuFonta(fontIndeks + 1); });
    }

    // Wake Lock - drži ekran budnim tijekom mise, uz uredan fallback.
    if (els.wakeLockToggle) {
      if (!WAKE_LOCK_PODRZAN) {
        els.wakeLockToggle.hidden = true;
      } else {
        els.wakeLockToggle.hidden = false;
        azurirajIkonuWakeLock();
        els.wakeLockToggle.addEventListener("click", function () {
          postaviWakeLockIzbor(zeljenoBudnoStanje !== "1");
        });
        zatraziWakeLock();
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === "visible") {
            zatraziWakeLock();
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
      els.dayInfo.addEventListener("click", otvoriIzbornikDana);
    }
    if (els.dayModalClose) {
      els.dayModalClose.addEventListener("click", zatvoriIzbornikDana);
    }

    inicijalizirajSwipe();
    inicijalizirajKontroleSekcija();
    inicijalizirajNacinMiseListener();

    if (els.nacinMiseCheckbox) {
      els.nacinMiseCheckbox.checked = nacinMiseAktivan;
      els.nacinMiseCheckbox.addEventListener("change", function () {
        postaviNacinMise(els.nacinMiseCheckbox.checked);
      });
    }

    ucitajPodatke().then(function () {
      azurirajBannerIsteka();
      var zadani = odaberiZadaniDan();
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
        '<br><span class="loading-msg__detalj">(' + escapeHtml(err.message) + ")</span></p>";
    });

    window.addEventListener("online", azurirajOfflineOznaku);
    window.addEventListener("offline", azurirajOfflineOznaku);
    azurirajOfflineOznaku();
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

  if ("serviceWorker" in navigator) {
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
})();
