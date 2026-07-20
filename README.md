# Kalendar misa - vodič kroz red mise (PWA)

## Struktura projekta

```
Kalendar misa/
├── index.html          - glavna stranica
├── manifest.json        - PWA manifest (instalacija na mobitel)
├── service-worker.js    - omogućuje 100% offline rad
├── data.json             - PROMJENJIVI dijelovi (čitanja) po danu - ovdje lijepite tekstove
├── css/style.css
├── js/
│   ├── app.js             - logika aplikacije (učitavanje, prikaz, accordion)
│   └── fixed-prayers.js   - NEPROMJENJIVE molitve (Ispovijedam se, Slava, Vjerovanje, Svet, Oče naš, Jaganjče Božji)
├── icons/icon.svg
└── README.md
```

## Kako popuniti čitanja

Otvorite `data.json`. Svaki dan u polju `dani` ima ovu strukturu (primjer je potpuno popunjen za "1. nedjelju došašća" na vrhu popisa):

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

Trenutno su u datoteci sve nedjelje i 4 zapovjedne svetkovine (Božić, Tijelovo, Velika Gospa, Svi Sveti) za liturgijsku godinu A, od 30.11.2025. do 22.11.2026. Za sljedeću liturgijsku godinu B (počinje 29.11.2026.) dodajte nove unose po istom obrascu.

## Kako pokrenuti / instalirati aplikaciju

Service Worker (koji omogućuje offline rad) **ne radi ako datoteku samo otvorite dvoklikom** (`file://...`). Potreban je lokalni ili pravi web-poslužitelj. Najjednostavnije opcije:

1. **Lokalno testiranje (računalo):** u ovoj mapi pokrenite npr. `python -m http.server 8000` i otvorite `http://localhost:8000` u pregledniku.
2. **Objava online (preporučeno za stvarno korištenje):** postavite cijelu mapu na besplatan hosting kao što je GitHub Pages, Netlify ili Vercel (samo "drag & drop" mape). Dobijete javni link koji otvorite na mobitelu.
3. Kad stranicu otvorite putem `http://` ili `https://`, preglednik će ponuditi "Dodaj na početni zaslon" / "Instaliraj aplikaciju" - nakon toga radi i bez interneta.

## Napomena o ikoni

Ikona (`icons/icon.svg`) je u SVG formatu. Radi na Androidu/Chromeu bez problema. Za savršenu podršku na starijim iOS uređajima možete SVG pretvoriti u PNG (192x192 i 512x512) besplatnim alatom poput realfavicongenerator.net i dodati ih u `manifest.json`.

## Ažuriranje sadržaja nakon instalacije

Ako promijenite `data.json` (dodate tekstove) nakon što je netko već instalirao aplikaciju, povećajte broj verzije u `service-worker.js` (`CACHE_NAME = "kalendar-misa-v2"` itd.) kako bi svi dobili novu verziju umjesto stare iz predmemorije.
