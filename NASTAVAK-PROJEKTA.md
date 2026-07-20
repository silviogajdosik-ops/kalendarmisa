# Kalendar misa - upute za nastavak rada (Cowork kod kuće)

Ova datoteka postoji zato da nova Cowork sesija (koja ne vidi ovaj razgovor) odmah zna što je projekt, što je gotovo i što treba dalje. Kad kod kuće otvoriš Cowork, priloži cijelu raspakiranu mapu i u prvoj poruci referiraj ovu datoteku (prijedlog poruke je na dnu).

## Što je ovo

Progressive Web App (PWA) "Kalendar misa" - vodič za praćenje reda katoličke mise za nedjelje i zapovjedne svetkovine u Hrvatskoj, za korištenje u crkvi, radi 100% offline nakon instalacije.

## Struktura datoteka

```
Kalendar misa/
├── index.html            glavna stranica
├── manifest.json          PWA manifest
├── service-worker.js      offline predmemorija (cache-first)
├── data.json               PROMJENJIVI dio: čitanja po danu (ovdje se lijepi tekst)
├── pokreni.bat             pokretanje lokalnog servera na Windowsu (dvoklik)
├── README.md                opće upute (hosting, popunjavanje čitanja)
├── NASTAVAK-PROJEKTA.md     ova datoteka
├── css/style.css
├── js/
│   ├── app.js               logika: učitavanje, accordion prikaz, date picker, boje
│   └── fixed-prayers.js     NEPROMJENJIVI dio: stalne molitve (hardkodirano)
└── icons/icon.svg
```

## Ključne odluke (da se ne ponavljaju pitanja)

- **Opseg podataka**: `data.json` sadrži SVE nedjelje + 4 zapovjedne svetkovine (Božić, Tijelovo, Velika Gospa, Svi Sveti) za cijelu liturgijsku godinu A, **30.11.2025. - 22.11.2026.** Datumi/nazivi su preuzeti izravno s liturgijskog kalendara Hrvatske biskupske konferencije (gcatholic.org), pa su provjereno točni.
- **Autorska prava**: tekstovi čitanja (`citanja.*.tekst`) su namjerno prazni u svim danima osim jednog potpuno popunjenog primjera (1. nedjelja došašća, Godina A) - to je bio izričit zahtjev jer su hrvatski liturgijski tekstovi zaštićeni.
- **Liturgijske boje**: automatski se mijenjaju po danu (ljubičasta/bijela/crvena/zelena) preko polja `boja` u `data.json` i CSS varijable `--akcent` u `app.js`.
- **Auto-detekcija dana**: aplikacija pri otvaranju sama pronađe prvi datum ≥ danas i prikaže ga; korisnik može ručno odabrati bilo koji drugi dan iz padajućeg izbornika.
- **Vjerovanje**: toggle dugo (Nicejsko-carigradsko) / kratko (Apostolsko), pamti se u `localStorage`.
- **Struktura po danu** u `data.json`: `id, datum, naziv, vrijeme, boja, bojaNaziv, rang, zapovjedna, godinaCiklusa, citanja{prvo, psalam, drugo, evandelje}, molitvaVjernika[], napomena`. Detalji i primjer su u `README.md`.

## Git i hosting (od 20.7.2026.)

- Mapa je pravi git repozitorij, povezan na `https://github.com/silviogajdosik-ops/kalendarmisa.git` (remote `origin`, grana `main`).
- GitHub Pages je uključen (Deploy from a branch → main → /root) → javni link: **https://silviogajdosik-ops.github.io/kalendarmisa/** (rješava i offline/service-worker problem bez lokalnog servera).
- Git credential (GitHub token) spremljen je u Windows Credential Manager preko `git-credential-manager`, tako da `git push`/`git pull` iz ove mape rade bez ponovnog unosa lozinke/tokena.
- Napomena: git operacije treba raditi iz stvarne Windows mape (kako je opisano gore), ne kroz Cowork-ov sandbox most prema mapi - taj most ne podržava git-ove zaključane/privremene datoteke pa git tamo ne radi ispravno.

## Poznata ograničenja / stvari koje NISU riješene

1. **Ikona je samo SVG** (`icons/icon.svg`) - radi na Androidu/Chromeu, ali za savršenu podršku na starijim iOS uređajima trebalo bi generirati i PNG verzije (192x192, 512x512) i dodati ih u `manifest.json`. Nisam to mogao napraviti jer sandbox u toj sesiji nije imao izvršno okruženje (Python/Pillow) za generiranje PNG-a - kod kuće to je lako riješiti.
2. **Service Worker ne radi preko `file://`** - mora se poslužiti preko `http(s)://`. Zato postoji `pokreni.bat` (lokalno) i preporuka za stvarni hosting (Netlify Drop, GitHub Pages) u `README.md`.
3. **Godina B nije unesena** - `data.json` ide samo do 22.11.2026. (kraj Godine A). Za nastavak nakon toga (od 29.11.2026., Godina B) treba dodati nove unose po istom obrascu.
4. **Tekstovi čitanja nisu popunjeni** - to je glavni preostali posao, ručno lijepljenje iz službenog liturgijskog izdanja u polja `referenca` i `tekst` za svaki dan u `data.json`.
5. **Nije testirano na stvarnom mobitelu** - vrijedilo bi provjeriti instalaciju i offline rad na Androidu i iPhoneu.
6. **Nema automatske validacije JSON-a** - `data.json` je pisan ručno pa vrijedi provjeriti da je i dalje ispravan JSON nakon svakog unosa teksta (npr. alatom kao jsonlint.com ili `python -m json.tool data.json`).

## Kako nastaviti kod kuće

1. Raspakiraj zip u novu mapu (npr. `Kalendar misa`).
2. U Coworku poveži tu mapu.
3. Zalijepi otprilike ovu poruku:

   > Nastavljam raditi na PWA projektu "Kalendar misa" iz priložene mape. Pročitaj `NASTAVAK-PROJEKTA.md` i `README.md` za kontekst. [ovdje napiši što točno želiš dalje - npr. "Pomozi mi unijeti tekstove čitanja za sljedeće tri nedjelje" ili "Generiraj PNG ikone" ili "Pripremi upute za postavljanje na Netlify"]

4. Ako je sandbox okruženje dostupno (bash/Python), dobra prilika je odmah zatražiti generiranje PNG ikona i/ili automatsku validaciju `data.json`.

## Testiranje promjena

Nakon svake izmjene `data.json` (ili bilo koje druge datoteke), poveća se broj verzije u `service-worker.js`:

```js
const CACHE_NAME = "kalendar-misa-v2"; // bio v1
```

Inače će korisnici koji su već instalirali aplikaciju i dalje vidjeti staru (predmemoriranu) verziju.
