#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
provjeri.py
Mala provjera prije svakog pusha na GitHub za projekt "Kalendar misa".

Provjerava:
  1. Da su sve data-godina-*.json datoteke ispravan JSON i imaju očekivanu
     osnovnu strukturu (dani, obavezna polja, id == datum, nema duplih datuma).
  2. Da APP_VERZIJA (js/verzija.js) i CACHE_NAME (service-worker.js) imaju
     ISTI broj verzije (CACHE_NAME mora biti "kalendar-misa-<APP_VERZIJA>").

Pokreni iz korijena projekta (ili bilo odakle - putanje se računaju
u odnosu na mjesto ove skripte):

    python provjeri.py

Izlazni kod 0 = sve prošlo, 1 = nađena barem jedna greška.
"""

import glob
import json
import os
import re
import sys

KORIJEN = os.path.dirname(os.path.abspath(__file__))

OBAVEZNA_POLJA_DANA = [
    "id", "datum", "naziv", "vrijeme", "boja", "bojaNaziv",
    "rang", "zapovjedna", "godinaCiklusa", "citanja",
    "molitvaVjernika", "napomena"
]
OBAVEZNA_POD_POLJA_CITANJA = ["prvo", "psalam", "drugo", "evandelje"]

greske = []
upozorenja = []


def greska(poruka):
    greske.append(poruka)
    print("  [GREŠKA] " + poruka)


def upozorenje(poruka):
    upozorenja.append(poruka)
    print("  [upozorenje] " + poruka)


def provjeri_datum_yyyy_mm_dd(s):
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", s or ""):
        return False
    try:
        import datetime
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False


def provjeri_data_datoteku(putanja, svi_datumi_globalno):
    print("\nProvjera: " + os.path.basename(putanja))
    try:
        with open(putanja, encoding="utf-8") as f:
            sadrzaj = json.load(f)
    except json.JSONDecodeError as e:
        greska(os.path.basename(putanja) + ": nije ispravan JSON (" + str(e) + ")")
        return
    except OSError as e:
        greska(os.path.basename(putanja) + ": ne mogu otvoriti datoteku (" + str(e) + ")")
        return

    dani = sadrzaj.get("dani")
    if not isinstance(dani, list) or len(dani) == 0:
        greska(os.path.basename(putanja) + ": polje 'dani' nedostaje, nije lista ili je prazno")
        return

    datumi_u_datoteci = set()

    for i, dan in enumerate(dani):
        oznaka = os.path.basename(putanja) + " [" + str(i) + "] (id=" + str(dan.get("id")) + ")"

        if not isinstance(dan, dict):
            greska(oznaka + ": zapis dana nije objekt")
            continue

        for polje in OBAVEZNA_POLJA_DANA:
            if polje not in dan:
                greska(oznaka + ": nedostaje obavezno polje '" + polje + "'")

        if "id" in dan and "datum" in dan and dan["id"] != dan["datum"]:
            greska(oznaka + ": 'id' (" + str(dan["id"]) + ") razlikuje se od 'datum' (" + str(dan["datum"]) + ")")

        datum = dan.get("datum")
        if datum and not provjeri_datum_yyyy_mm_dd(datum):
            greska(oznaka + ": 'datum' nije u ispravnom formatu YYYY-MM-DD (" + str(datum) + ")")
        elif datum:
            if datum in datumi_u_datoteci:
                greska(os.path.basename(putanja) + ": datum " + datum + " se ponavlja unutar iste datoteke")
            datumi_u_datoteci.add(datum)

            if datum in svi_datumi_globalno:
                upozorenje("datum " + datum + " se pojavljuje u više od jedne data-godina datoteke (" +
                           svi_datumi_globalno[datum] + " i " + os.path.basename(putanja) + ")")
            else:
                svi_datumi_globalno[datum] = os.path.basename(putanja)

        citanja = dan.get("citanja")
        if not isinstance(citanja, dict):
            greska(oznaka + ": polje 'citanja' nedostaje ili nije objekt")
        else:
            for pod in OBAVEZNA_POD_POLJA_CITANJA:
                if pod not in citanja:
                    greska(oznaka + ": u 'citanja' nedostaje '" + pod + "'")
                elif not isinstance(citanja[pod], dict):
                    greska(oznaka + ": 'citanja." + pod + "' nije objekt")

        if "molitvaVjernika" in dan and not isinstance(dan["molitvaVjernika"], list):
            greska(oznaka + ": 'molitvaVjernika' nije lista")

    print("  OK - " + str(len(dani)) + " dana, JSON ispravan, struktura provjerena.")


def izvuci_vrijednost(putanja, regex_uzorak, naziv_polja):
    try:
        with open(putanja, encoding="utf-8") as f:
            sadrzaj = f.read()
    except OSError as e:
        greska(os.path.basename(putanja) + ": ne mogu pročitati datoteku (" + str(e) + ")")
        return None

    m = re.search(regex_uzorak, sadrzaj)
    if not m:
        greska(os.path.basename(putanja) + ": ne mogu pronaći '" + naziv_polja + "' u datoteci")
        return None
    return m.group(1)


def provjeri_verzije():
    print("\nProvjera verzija (APP_VERZIJA vs CACHE_NAME):")

    putanja_verzija = os.path.join(KORIJEN, "js", "verzija.js")
    putanja_sw = os.path.join(KORIJEN, "service-worker.js")

    app_verzija = izvuci_vrijednost(putanja_verzija, r'APP_VERZIJA\s*=\s*"([^"]+)"', "APP_VERZIJA")
    cache_name = izvuci_vrijednost(putanja_sw, r'CACHE_NAME\s*=\s*"([^"]+)"', "CACHE_NAME")

    if app_verzija is None or cache_name is None:
        return

    ocekivani_cache_name = "kalendar-misa-" + app_verzija

    print("  js/verzija.js       APP_VERZIJA = \"" + app_verzija + "\"")
    print("  service-worker.js   CACHE_NAME  = \"" + cache_name + "\"")

    if cache_name != ocekivani_cache_name:
        greska(
            "CACHE_NAME (\"" + cache_name + "\") ne odgovara APP_VERZIJA (\"" + app_verzija +
            "\") - očekivano je \"" + ocekivani_cache_name + "\". "
            "Ispravi jedno od dva mjesta prije pusha (inače će korisnici ostati na staroj predmemoriranoj verziji)."
        )
    else:
        print("  OK - CACHE_NAME odgovara APP_VERZIJA.")


def main():
    print("=== provjeri.py - Kalendar misa: provjera prije pusha ===")

    svi_datumi_globalno = {}
    datoteke = sorted(glob.glob(os.path.join(KORIJEN, "data-godina-*.json")))

    if not datoteke:
        upozorenje("Nema nijedne data-godina-*.json datoteke u " + KORIJEN)
    else:
        for putanja in datoteke:
            provjeri_data_datoteku(putanja, svi_datumi_globalno)

    provjeri_verzije()

    print("\n" + "=" * 50)
    if greske:
        print("NEUSPJEH: " + str(len(greske)) + " grešaka (" + str(len(upozorenja)) + " upozorenja).")
        print("Ne pushaj dok se greške ne isprave.")
        sys.exit(1)
    else:
        napomena_upozorenja = (" (" + str(len(upozorenja)) + " upozorenja)") if upozorenja else ""
        print("SVE PROŠLO" + napomena_upozorenja + " - u redu je za push.")
        sys.exit(0)


if __name__ == "__main__":
    main()
