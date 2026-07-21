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
│   ├── verzija.js         - broj verzije aplikacije (jedino mjesto gdje se mijenja, uz CACHE_NAME)
│   ├── app.js             - logika aplikacije (učitavanje, prikaz, accordion, tema)
│   └── fixed-prayers.js   - NEPROMJENJIVE molitve (Ispovijedam se, Slava, Vjerovanje, Svet, Oče naš, Jaganjče Božji)
├── icons/                 - icon.svg + icon-192.png + icon-512.png
├── PROMJENE.md            - povijest promjena po verzijama (changelog)
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

## Ikone

U `icons/` su SVG ikona i PNG verzije (192x192, 512x512) generirane iz nje - sve tri su navedene u `manifest.json`, čime je pokrivena i instalacija na iOS-u.

## Verzioniranje

Aplikacija koristi semantičko verzioniranje **X.Y.Z** (npr. 1.0.0). Broj je vidljiv u podnožju aplikacije, pa korisnik uvijek može provjeriti ima li najnoviju verziju.

Kada se povećava koji broj:

- **Z (zakrpa)**, npr. 1.0.0 → 1.0.1: ispravak greške, sitna korekcija teksta ili stila, bez novih mogućnosti.
- **Y (mogućnost)**, npr. 1.0.1 → 1.1.0: nova ili promijenjena mogućnost, ili veći dodatak podataka (npr. nova liturgijska godina). Z se resetira na 0.
- **X (velika izmjena)**, npr. 1.1.0 → 2.0.0: veliki redizajn ili prerada aplikacije. Y i Z se resetiraju na 0.

Postupak objave nove verzije (sva 3 koraka, uvijek):

1. Promijeni `APP_VERZIJA` u `js/verzija.js`.
2. Promijeni `CACHE_NAME` u `service-worker.js` na **isti** broj (npr. `"kalendar-misa-1.0.1"`) - to tjera instalirane aplikacije da preuzmu novu verziju umjesto stare iz predmemorije.
3. Dodaj zapis na vrh `PROMJENE.md` (verzija, datum, što je promijenjeno).

Zatim commit i push na GitHub - GitHub Pages automatski poslužuje novu verziju, a instalirane aplikacije se same osvježe pri sljedećem otvaranju s internetom.
