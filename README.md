# Kalendar misa - vodič kroz red mise (PWA)

## Struktura projekta

```
Kalendar misa/
├── index.html          - glavna stranica
├── manifest.json        - PWA manifest (instalacija na mobitel)
├── service-worker.js    - omogućuje 100% offline rad
├── data-index.json       - popis datoteka s podacima po liturgijskim godinama
├── data-godina-A.json    - PROMJENJIVI dijelovi (čitanja) za liturgijsku godinu A - ovdje lijepite tekstove
├── css/style.css
├── js/
│   ├── app.js             - logika aplikacije (učitavanje, prikaz, accordion, tema)
│   └── fixed-prayers.js   - NEPROMJENJIVE molitve (Ispovijedam se, Slava, Vjerovanje, Svet, Oče naš, Jaganjče Božji)
├── icons/icon.svg
└── README.md
```

Podaci su razdvojeni po liturgijskim godinama (A/B/C) radi lakšeg ručnog uređivanja i manjih datoteka. Kad se doda nova godina (npr. `data-godina-B.json`), dovoljno ju je dodati u popis `datoteke` unutar `data-index.json` - aplikacija ih automatski učita i spoji.

## Kako popuniti čitanja

Otvorite `data-godina-A.json` (ili odgovarajuću datoteku za drugu liturgijsku godinu). Svaki dan u polju `dani` ima ovu strukturu (primjer je potpuno popunjen za "1. nedjelju došašća" na vrhu popisa):

```json
{
  "id": "2026-07-26",
  "datum": "2026-07-26",
  "naziv": "17. nedjelja kroz godinu",
  "vrijeme": "krozGodinu",
  "boja": "zelena",
  "rang": "nedjelja",
  "zapovjedna": false,
  "godinaCiklusa": "A",
  "citanja": {
    "prvo":      { "referenca": "...", "naslov": "...", "tekst": "..." },
    "psalam":    { "referenca": "...", "pripjev": "...", "tekst": "..." },
    "drugo":     { "referenca": "...", "naslov": "...", "tekst": "..." },
    "evandelje": { "referenca": "...", "naslov": "...", "tekst": "..." }
  },
  "molitvaVjernika": ["nakana 1", "nakana 2"],
  "napomena": "slobodan tekst"
}
```

Samo popunite polja `referenca` i `tekst` (i po želji `naslov`, `pripjev`, `molitvaVjernika`) - ostalo ne dirajte. Aplikacija automatski prikazuje "Tekst još nije unesen" dok je polje prazno.

Trenutno su u datoteci sve nedjelje i 4 zapovjedne svetkovine (Božić, Tijelovo, Velika Gospa, Svi Sveti) za liturgijsku godinu A, od 30.11.2025. do 22.11.2026. Za sljedeću liturgijsku godinu B (počinje 29.11.2026.) dodajte novu datoteku `data-godina-B.json` po istom obrascu i upišite je u `data-index.json`.

### Izvor teksta čitanja

Tekstovi čitanja preuzimaju se iz javno dostupnog (public domain) prijevoda Biblije Ivana Šarića (1942.), objavljenog na [eBible.org](https://ebible.org/hrv/copyright.htm). To NIJE službeni liturgijski prijevod HBK-a - riječi se mogu razlikovati od onoga što svećenik čita na misi, iako reference (biblijski navodi) odgovaraju istim ulomcima iz lekcionara. To je jasno napisano i u podnožju same aplikacije. Ako želite umjesto toga službeni prijevod, zamijenite `tekst` polja ručno iz misala/lekcionara - autorska prava na taj prijevod ne dopuštaju automatsko preuzimanje.

## Dark tema

Aplikacija ima prekidač za tamnu temu (gumb 🌙/☀ u zaglavlju). Odabir se pamti u `localStorage` (`temaIzbor`), a pri prvom otvaranju prati postavku uređaja (`prefers-color-scheme`).

## Kako pokrenuti / instalirati aplikaciju

Service Worker (koji omogućuje offline rad) **ne radi ako datoteku samo otvorite dvoklikom** (`file://...`). Potreban je lokalni ili pravi web-poslužitelj. Najjednostavnije opcije:

1. **Lokalno testiranje (računalo):** u ovoj mapi pokrenite npr. `python -m http.server 8000` i otvorite `http://localhost:8000` u pregledniku.
2. **Objava online (preporučeno za stvarno korištenje):** postavite cijelu mapu na besplatan hosting kao što je GitHub Pages, Netlify ili Vercel (samo "drag & drop" mape). Dobijete javni link koji otvorite na mobitelu.
3. Kad stranicu otvorite putem `http://` ili `https://`, preglednik će ponuditi "Dodaj na početni zaslon" / "Instaliraj aplikaciju" - nakon toga radi i bez interneta.

## Napomena o ikoni

Ikona (`icons/icon.svg`) je u SVG formatu. Radi na Androidu/Chromeu bez problema. Za savršenu podršku na starijim iOS uređajima možete SVG pretvoriti u PNG (192x192 i 512x512) besplatnim alatom poput realfavicongenerator.net i dodati ih u `manifest.json`.

## Ažuriranje sadržaja nakon instalacije

Ako promijenite bilo koju `data-godina-*.json` datoteku (dodate tekstove) nakon što je netko već instalirao aplikaciju, povećajte broj verzije u `service-worker.js` (`CACHE_NAME = "kalendar-misa-v3"` itd.) kako bi svi dobili novu verziju umjesto stare iz predmemorije.
