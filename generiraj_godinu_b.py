# -*- coding: utf-8 -*-
"""
generiraj_godinu_b.py
Generira KOSTUR data-godina-B.json (samo datumi, nazivi, liturgijske boje/rang -
BEZ tekstova čitanja, koji se popunjavaju kasnije ručno iz Šarić prijevoda).

Liturgijska godina B: 29.11.2026. (1. nedjelja došašća) do dana prije
1. nedjelje došašća 2027. (koja počinje Godinu C).

Datumi pokretnih blagdana računaju se algoritamski (Anonymous Gregorian /
Meeus-Jones-Butcher algoritam za Uskrs - deterministički, nema mrežne ovisnosti).
Algoritam je samotestiran protiv već poznatih i provjerenih datuma Godine A
(vidi provjeri_godinu_a() ispod) prije nego što se primijeni na Godinu B.
"""
import datetime
import json


def uskrs(godina):
    """Datum Uskrsa (Gregorijanski kalendar) - Meeus/Jones/Butcher algoritam."""
    a = godina % 19
    b = godina // 100
    c = godina % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    mjesec = (h + l - 7 * m + 114) // 31
    dan = ((h + l - 7 * m + 114) % 31) + 1
    return datetime.date(godina, mjesec, dan)


def nedjelja_na_ili_prije(d):
    pomak = (d.weekday() - 6) % 7  # weekday(): Mon=0..Sun=6
    return d - datetime.timedelta(days=pomak)


def prva_nedjelja_dosasca(godina_bozica):
    """1. nedjelja došašća koja PRETHODI Božiću te godine (4. nedjelja došašća minus 3 tjedna)."""
    bozic = datetime.date(godina_bozica, 12, 25)
    cetvrta_dosasca = nedjelja_na_ili_prije(bozic)
    if cetvrta_dosasca == bozic:
        # Božić je nedjelja - 4. nedjelja došašća je ipak nedjelja prije (rijedak rubni slučaj)
        cetvrta_dosasca = cetvrta_dosasca - datetime.timedelta(days=7)
    return cetvrta_dosasca - datetime.timedelta(weeks=3)


def sveta_obitelj(godina_bozica):
    bozic = datetime.date(godina_bozica, 12, 25)
    if bozic.weekday() == 6:  # Božić je nedjelja
        return datetime.date(godina_bozica, 12, 30)
    for dan in range(26, 32):
        d = datetime.date(godina_bozica, 12, dan)
        if d.weekday() == 6:
            return d
    return None


def druga_nedjelja_po_bozicu(godina_bozica):
    """Vraća datum (siječanj godina_bozica+1) ako postoji nedjelja 2.-5. siječnja, inače None."""
    god = godina_bozica + 1
    for dan in range(2, 6):
        d = datetime.date(god, 1, dan)
        if d.weekday() == 6:
            return d
    return None


def krstenje_gospodinovo(godina):
    bogojavljenje = datetime.date(godina, 1, 6)
    if bogojavljenje.weekday() == 6:
        return bogojavljenje
    dani_do_nedjelje = (6 - bogojavljenje.weekday()) % 7
    if dani_do_nedjelje == 0:
        dani_do_nedjelje = 7
    return bogojavljenje + datetime.timedelta(days=dani_do_nedjelje)


def izracunaj_kalendar(godina_dosasca):
    """
    godina_dosasca: kalendarska godina u kojoj počinje došašće (npr. 2026 za Godinu B
    koja počinje 29.11.2026.). Vraća popis svih nedjelja/svetkovina te liturgijske godine
    (od 1. nedjelje došašća do subote prije 1. nedjelje došašća sljedeće godine).
    """
    god_glavnine = godina_dosasca + 1  # kalendarska godina u kojoj je većina godine (siječanj-studeni)

    dosasce1 = prva_nedjelja_dosasca(godina_dosasca)
    dosasce4 = nedjelja_na_ili_prije(datetime.date(godina_dosasca, 12, 25))
    if dosasce4 == datetime.date(godina_dosasca, 12, 25):
        dosasce4 = dosasce4 - datetime.timedelta(days=7)
    bozic = datetime.date(godina_dosasca, 12, 25)
    obitelj = sveta_obitelj(godina_dosasca)
    druga_po_bozicu = druga_nedjelja_po_bozicu(godina_dosasca)
    krstenje = krstenje_gospodinovo(god_glavnine)

    uskrs_datum = uskrs(god_glavnine)
    pepelnica = uskrs_datum - datetime.timedelta(days=46)
    cvjetnica = uskrs_datum - datetime.timedelta(days=7)
    duhovi = uskrs_datum + datetime.timedelta(days=49)
    trojstvo = duhovi + datetime.timedelta(days=7)
    tijelovo = trojstvo + datetime.timedelta(days=4)  # četvrtak nakon Trojstva (hrvatski običaj)

    dosasce1_sljedece = prva_nedjelja_dosasca(god_glavnine)
    krist_kralj = dosasce1_sljedece - datetime.timedelta(days=7)

    velika_gospa = datetime.date(god_glavnine, 8, 15)
    svi_sveti = datetime.date(god_glavnine, 11, 1)

    # ---- Redovno vrijeme kroz godinu: naprijed od Krštenja, natrag od Krista Kralja ----
    brojevi_po_datumu = {}

    d = krstenje + datetime.timedelta(days=7)
    broj = 2
    while d < pepelnica:
        brojevi_po_datumu[d] = broj
        broj += 1
        d += datetime.timedelta(days=7)

    prva_obnovljena_nedjelja = trojstvo + datetime.timedelta(days=7)
    d = krist_kralj
    broj = 34
    while d >= prva_obnovljena_nedjelja:
        brojevi_po_datumu[d] = broj
        broj -= 1
        d -= datetime.timedelta(days=7)

    # Ako Velika Gospa ili Svi Sveti padnu na nedjelju koja bi inače bila redovna
    # ("kroz godinu") nedjelja, svetkovina ima prednost - taj redni broj se preskače.
    # Isus Krist Kralj se UVIJEK dodaje posebno (dodaj() poziv niže), nikad kao
    # "34. nedjelja kroz godinu" - zato i njegov datum uklanjamo iz brojevi_po_datumu
    # da ga petlja "redovno vrijeme nakon Tijelova" ne doda dvaput.
    for fiksni in (velika_gospa, svi_sveti, krist_kralj):
        if fiksni in brojevi_po_datumu:
            del brojevi_po_datumu[fiksni]

    dani = []

    def dodaj(datum, naziv, vrijeme, boja, boja_naziv, rang, zapovjedna):
        dani.append({
            "id": datum.isoformat(),
            "datum": datum.isoformat(),
            "naziv": naziv,
            "vrijeme": vrijeme,
            "boja": boja,
            "bojaNaziv": boja_naziv,
            "rang": rang,
            "zapovjedna": zapovjedna,
            "godinaCiklusa": "B",
            "citanja": {
                "prvo": {"referenca": "", "naslov": "", "tekst": ""},
                "psalam": {"referenca": "", "pripjev": "", "tekst": ""},
                "drugo": {"referenca": "", "naslov": "", "tekst": ""},
                "evandelje": {"referenca": "", "naslov": "", "tekst": ""}
            },
            "molitvaVjernika": [],
            "napomena": ""
        })

    # Došašće
    dodaj(dosasce1, "1. nedjelja došašća", "dosasce", "ljubicasta", "Ljubičasta", "nedjelja", False)
    dosasce2 = dosasce1 + datetime.timedelta(weeks=1)
    dodaj(dosasce2, "2. nedjelja došašća", "dosasce", "ljubicasta", "Ljubičasta", "nedjelja", False)
    dosasce3 = dosasce1 + datetime.timedelta(weeks=2)
    dodaj(dosasce3, "3. nedjelja došašća (Gaudete)", "dosasce", "ljubicasta",
          "Ljubičasta (dopuštena ružičasta)", "nedjelja", False)
    dodaj(dosasce4, "4. nedjelja došašća", "dosasce", "ljubicasta", "Ljubičasta", "nedjelja", False)

    # Božić i vrijeme božićno
    dodaj(bozic, "Božić - Rođenje Gospodinovo", "bozicno", "bijela", "Bijela", "svetkovina", True)
    if obitelj:
        dodaj(obitelj, "Sveta Obitelj Isusa, Marije i Josipa", "bozicno", "bijela", "Bijela", "blagdan", False)
    if druga_po_bozicu:
        dodaj(druga_po_bozicu, "2. nedjelja po Božiću", "bozicno", "bijela", "Bijela", "nedjelja", False)
    dodaj(krstenje, "Krštenje Gospodinovo", "bozicno", "bijela", "Bijela", "blagdan", False)

    # Redovno vrijeme prije korizme
    for datum in sorted(d for d in brojevi_po_datumu if d < pepelnica):
        broj = brojevi_po_datumu[datum]
        dodaj(datum, str(broj) + ". nedjelja kroz godinu", "krozGodinu", "zelena", "Zelena", "nedjelja", False)

    # Korizma
    korizma_nazivi = ["1. korizmena nedjelja", "2. korizmena nedjelja", "3. korizmena nedjelja",
                       "4. korizmena nedjelja (Laetare)", "5. korizmena nedjelja"]
    for idx, naziv in enumerate(korizma_nazivi):
        datum = cvjetnica - datetime.timedelta(weeks=(5 - idx))
        boja_naziv = "Ljubičasta (dopuštena ružičasta)" if idx == 3 else "Ljubičasta"
        dodaj(datum, naziv, "korizma", "ljubicasta", boja_naziv, "nedjelja", False)
    dodaj(cvjetnica, "Cvjetnica - Nedjelja Muke Gospodnje", "korizma", "crvena", "Crvena", "nedjelja", False)

    # Vazmeno vrijeme
    dodaj(uskrs_datum, "Uskrs - Nedjelja Uskrsnuća Gospodinova", "vazmeno", "bijela", "Bijela", "svetkovina", False)
    vazmeni_nazivi = [
        "2. vazmena nedjelja (Božje milosrđe)", "3. vazmena nedjelja", "4. vazmena nedjelja",
        "5. vazmena nedjelja", "6. vazmena nedjelja", "7. vazmena nedjelja"
    ]
    for idx, naziv in enumerate(vazmeni_nazivi):
        datum = uskrs_datum + datetime.timedelta(weeks=(idx + 1))
        dodaj(datum, naziv, "vazmeno", "bijela", "Bijela", "nedjelja", False)
    dodaj(duhovi, "Pedesetnica - Duhovi", "vazmeno", "crvena", "Crvena", "svetkovina", False)

    # Trojstvo, Tijelovo
    dodaj(trojstvo, "Presveto Trojstvo", "krozGodinu", "bijela", "Bijela", "svetkovina", False)
    dodaj(tijelovo, "Tijelovo - Presveto Tijelo i Krv Kristova", "krozGodinu", "bijela", "Bijela", "svetkovina", True)

    # Redovno vrijeme nakon Duhova/Tijelova
    for datum in sorted(d for d in brojevi_po_datumu if d > tijelovo):
        broj = brojevi_po_datumu[datum]
        dodaj(datum, str(broj) + ". nedjelja kroz godinu", "krozGodinu", "zelena", "Zelena", "nedjelja", False)
        if datum == velika_gospa - datetime.timedelta(days=0):
            pass  # (Velika Gospa se dodaje posebno ispod, na svom točnom mjestu po datumu)

    # Umetni Veliku Gospu i Sve Svete na njihove točne datume (redoslijed po datumu ispravlja se na kraju)
    dodaj(velika_gospa, "Velika Gospa - Uznesenje Blažene Djevice Marije", "krozGodinu", "bijela", "Bijela",
          "svetkovina", True)
    dodaj(svi_sveti, "Svi Sveti", "krozGodinu", "bijela", "Bijela", "svetkovina", True)

    # Krist Kralj
    dodaj(krist_kralj, "Isus Krist Kralj svega stvorenja", "krozGodinu", "bijela", "Bijela", "nedjelja", False)

    dani.sort(key=lambda x: x["datum"])

    # Sažetak ključnih datuma za ispis/provjeru
    sazetak = {
        "1. nedjelja došašća (početak godine)": dosasce1.isoformat(),
        "Božić": bozic.isoformat(),
        "Sveta Obitelj": obitelj.isoformat() if obitelj else None,
        "2. nedjelja po Božiću": druga_po_bozicu.isoformat() if druga_po_bozicu else "(nema te godine)",
        "Krštenje Gospodinovo": krstenje.isoformat(),
        "Pepelnica (samo za orijentaciju, nije u popisu)": pepelnica.isoformat(),
        "Cvjetnica": cvjetnica.isoformat(),
        "Uskrs": uskrs_datum.isoformat(),
        "Duhovi": duhovi.isoformat(),
        "Presveto Trojstvo": trojstvo.isoformat(),
        "Tijelovo": tijelovo.isoformat(),
        "Velika Gospa": velika_gospa.isoformat(),
        "Svi Sveti": svi_sveti.isoformat(),
        "Isus Krist Kralj (kraj godine)": krist_kralj.isoformat(),
        "1. nedjelja došašća sljedeće godine (Godina C)": dosasce1_sljedece.isoformat(),
    }

    return dani, sazetak


def provjeri_godinu_a():
    """Samotest: pokreni algoritam za Godinu A (došašće počinje 2025.) i usporedi
    ključne datume s already-known/provjerenim vrijednostima iz data-godina-A.json."""
    dani, sazetak = izracunaj_kalendar(2025)
    ocekivano = {
        "1. nedjelja došašća (početak godine)": "2025-11-30",
        "Božić": "2025-12-25",
        "Sveta Obitelj": "2025-12-28",
        "2. nedjelja po Božiću": "2026-01-04",
        "Krštenje Gospodinovo": "2026-01-11",
        "Cvjetnica": "2026-03-29",
        "Uskrs": "2026-04-05",
        "Duhovi": "2026-05-24",
        "Presveto Trojstvo": "2026-05-31",
        "Tijelovo": "2026-06-04",
        "Velika Gospa": "2026-08-15",
        "Svi Sveti": "2026-11-01",
        "Isus Krist Kralj (kraj godine)": "2026-11-22",
    }
    sve_ok = True
    for kljuc, ocekivana_vrijednost in ocekivano.items():
        stvarna = sazetak.get(kljuc)
        oznaka = "OK" if stvarna == ocekivana_vrijednost else "NE SLAŽE SE"
        if stvarna != ocekivana_vrijednost:
            sve_ok = False
        print("  {:<45} očekivano={:<12} izračunato={:<12} [{}]".format(
            kljuc, ocekivana_vrijednost, str(stvarna), oznaka))

    # Provjeri i par poznatih rednih brojeva "kroz godinu" iz Godine A
    provjera_brojeva = {"2026-01-18": "2. nedjelja kroz godinu", "2026-02-15": "6. nedjelja kroz godinu",
                         "2026-06-07": "10. nedjelja kroz godinu", "2026-11-08": "32. nedjelja kroz godinu",
                         "2026-11-15": "33. nedjelja kroz godinu"}
    nazivi_po_datumu = {d["datum"]: d["naziv"] for d in dani}
    for datum, ocekivani_naziv in provjera_brojeva.items():
        stvarni = nazivi_po_datumu.get(datum)
        oznaka = "OK" if stvarni == ocekivani_naziv else "NE SLAŽE SE"
        if stvarni != ocekivani_naziv:
            sve_ok = False
        print("  {:<45} očekivano={:<30} izračunato={:<30} [{}]".format(
            datum, ocekivani_naziv, str(stvarni), oznaka))

    # Provjeri da 2026-11-01 (Svi Sveti) NIJE dobio broj "31. nedjelja kroz godinu"
    # (poznato je da je u Godini A taj redni broj preskočen jer je Svi Sveti pao na nedjelju)
    ima_31 = any(d["naziv"] == "31. nedjelja kroz godinu" for d in dani)
    oznaka = "OK (31 je ispravno preskočena)" if not ima_31 else "GREŠKA (31 ne bi smjela postojati)"
    if ima_31:
        sve_ok = False
    print("  {:<45} {}".format("Nema '31. nedjelja kroz godinu' (Svi Sveti kolizija)", oznaka))

    print("\n  Broj dana ukupno izračunat za Godinu A:", len(dani), "(očekivano 55)")
    if len(dani) != 55:
        sve_ok = False

    return sve_ok


if __name__ == "__main__":
    print("=== Samotest algoritma protiv poznate/provjerene Godine A ===")
    ok = provjeri_godinu_a()
    print("\nSamotest:", "PROŠAO" if ok else "NIJE PROŠAO - NE nastavljaj bez provjere!")

    if not ok:
        raise SystemExit("Samotest nije prošao - zaustavljam se prije generiranja Godine B.")

    print("\n=== Računanje Godine B (došašće počinje 29.11.2026.) ===")
    dani_b, sazetak_b = izracunaj_kalendar(2026)
    for kljuc, vrijednost in sazetak_b.items():
        print("  {:<50} {}".format(kljuc, vrijednost))

    print("\nUkupno dana u Godini B:", len(dani_b))
    print("\nPuni popis (datum | naziv | vrijeme | boja | rang | zapovjedna):")
    for d in dani_b:
        print("  {} | {} | {} | {} | {} | {}".format(
            d["datum"], d["naziv"], d["vrijeme"], d["boja"], d["rang"], d["zapovjedna"]))

    izlaz = {
        "meta": {
            "opis": "Podaci za PWA 'Kalendar misa' - popis nedjelja i zapovjednih svetkovina za "
                    "liturgijsku godinu B prema liturgijskom kalendaru Hrvatske biskupske konferencije. "
                    "OVO JE KOSTUR - polja referenca/tekst/pripjev/naslov u 'citanja' i "
                    "'molitvaVjernika' su namjerno prazna i tek ih treba popuniti.",
            "liturgijskaGodina": "B",
            "razdoblje": {
                "od": dani_b[0]["datum"],
                "do": dani_b[-1]["datum"]
            },
            "napomenaAutorskaPrava": "Tekstovi čitanja (polja 'tekst') trebaju se popuniti iz javno dostupnog "
                                      "(public domain) prijevoda Biblije Ivana Šarića (1942., izvor: eBible.org, "
                                      "https://ebible.org/hrv/copyright.htm). To NIJE službeni liturgijski "
                                      "prijevod Hrvatske biskupske konferencije.",
            "zadnjeAzuriranje": datetime.date.today().isoformat(),
            "napomenaKostur": "Ova datoteka je generirana skriptom generiraj_godinu_b.py kao KOSTUR "
                               "(samo datumi/nazivi/boje/rang) - referenca i tekst polja su prazna i "
                               "namjerno NISU još popunjena. Datoteka JOŠ NIJE upisana u data-index.json "
                               "pa je aplikacija još ne učitava/prikazuje - to je sljedeći korak nakon "
                               "što se popune tekstovi."
        },
        "dani": dani_b
    }

    with open("data-godina-B.json", "w", encoding="utf-8") as f:
        json.dump(izlaz, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("\nZapisano: data-godina-B.json (" + str(len(dani_b)) + " dana)")
