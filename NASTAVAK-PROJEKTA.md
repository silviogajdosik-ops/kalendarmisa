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
├── data-index.json         popis data-godina-*.json datoteka koje app.js učitava i spaja
├── data-godina-A.json      PROMJENJIVI dio: čitanja po danu za liturgijsku godinu A (potpuno popunjen, 55/55)
├── data-godina-B.json      Liturgijska godina B (55 dana): potpuno popunjen (55/55 reference + tekstovi),
│                           upisan u data-index.json i service-worker.js cache (od verzije 1.2.0)
├── generiraj_godinu_b.py   Python skripta koja je generirala kostur data-godina-B.json (algoritamski,
│                           provjereno protiv gcatholic.org) - referenca za buduće godine (C, pa opet A...)
├── provjeri.py             validacijska skripta - pokreni prije SVAKOG pusha (vidi odjeljak niže)
├── pokreni.bat             pokretanje lokalnog servera na Windowsu (dvoklik)
├── README.md                opće upute (hosting, popunjavanje čitanja, verzioniranje)
├── PROMJENE.md              changelog - zapis za svaku objavljenu verziju
├── NASTAVAK-PROJEKTA.md     ova datoteka
├── GIT-UPUTE-ZA-CLAUDEA.md  generičke upute za git/GitHub (reusable za buduće projekte)
├── css/style.css
├── js/
│   ├── verzija.js           APP_VERZIJA - broj verzije koji se prikazuje u podnožju appa
│   ├── app.js               logika: učitavanje, accordion prikaz, date picker, boje, dark tema,
│   │                         veličina fonta, Wake Lock, gumb "Danas", swipe lijevo/desno
│   └── fixed-prayers.js     NEPROMJENJIVI dio: stalne molitve (hardkodirano)
└── icons/                   icon.svg + icon-192.png + icon-512.png
```

## Ključne odluke (da se ne ponavljaju pitanja)

- **Opseg podataka**: `data-godina-A.json` sadrži SVE nedjelje + 4 zapovjedne svetkovine (Božić, Tijelovo, Velika Gospa, Svi Sveti) za cijelu liturgijsku godinu A, **30.11.2025. - 22.11.2026.** Datumi/nazivi su preuzeti izravno s liturgijskog kalendara Hrvatske biskupske konferencije (gcatholic.org), pa su provjereno točni.
- **Razdvajanje po godinama** (od 20.7.2026.): podaci su razdvojeni u `data-godina-A.json` (i buduće `-B.json`, `-C.json`), popisane u `data-index.json` koji `app.js` čita i spaja. Odluka nije bila nužna zbog veličine (čak i puna godina s tekstovima staje ispod ~300 KB), nego zbog urednosti/lakšeg ručnog uređivanja - korisnikov izričit zahtjev.
- **Autorska prava / izvor teksta** (ažurirano 20.7.2026.): službeni liturgijski prijevod (HBK lekcionar) ostaje zaštićen i NE smije se automatski preuzimati. Umjesto toga, `citanja.*.tekst` polja popunjavaju se iz javno dostupnog (public domain) prijevoda Biblije Ivana Šarića (1942., izvor [eBible.org](https://ebible.org/hrv/copyright.htm)) - korisnikov izričit zahtjev nakon što sam mu objasnio razliku. To je jasno navedeno u podnožju appa i u `meta.napomenaAutorskaPrava` svake data-godina datoteke. "Molitva vjernika" (nakane) NIJE biblijski tekst nego pastoralno sastavljen - po korisnikovoj odluci to se za sada preskače (ostaje prazno), ne generira se automatski.
- **Liturgijske boje**: automatski se mijenjaju po danu (ljubičasta/bijela/crvena/zelena) preko polja `boja` u `data.json` i CSS varijable `--akcent` u `app.js`.
- **Auto-detekcija dana**: aplikacija pri otvaranju sama pronađe prvi datum ≥ danas i prikaže ga; korisnik može ručno odabrati bilo koji drugi dan iz padajućeg izbornika.
- **Vjerovanje**: toggle dugo (Nicejsko-carigradsko) / kratko (Apostolsko), pamti se u `localStorage`.
- **Dark tema** (od 20.7.2026.): gumb 🌙/☀ u zaglavlju, sprema izbor u `localStorage` (`temaIzbor`), prvi put prati `prefers-color-scheme` uređaja. CSS varijable pod `:root[data-tema="tamna"]` u `css/style.css`; inline skripta u `<head>` postavlja atribut prije prvog crtanja (bez bljeska krive teme).
- **Struktura po danu** u `data-godina-*.json`: `id, datum, naziv, vrijeme, boja, bojaNaziv, rang, zapovjedna, godinaCiklusa, citanja{prvo, psalam, drugo, evandelje}, molitvaVjernika[], napomena`. Detalji i primjer su u `README.md`.
- **Pristupačnost za crkvu** (od 21.7.2026., v1.1.0): podesiva veličina fonta (gumbi A−/A+ u zaglavlju, 4 koraka 15/17/19/21px, pamti se u `localStorage` ključu `fontIndeks`), Wake Lock API da se ekran ne gasi tijekom mise (gumb 🔆/🔅, uredan fallback ako preglednik ne podržava - gumb se sakrije), gumb "Danas" za brzi povratak na zadani dan, swipe lijevo/desno po glavnom sadržaju za prethodni/sljedeći dan.
- **Godina B - DOVRŠENO i uključeno u aplikaciju** (ažurirano 21.7.2026., verzija 1.2.0): `data-godina-B.json` sadrži svih 55 dana (29.11.2026. - 21.11.2027.), generiran skriptom `generiraj_godinu_b.py` (algoritamski računa pokretne blagdane - Uskrs preko Meeus/Jones/Butcher formule). Sve **55/55 reference** čitanja sastavljene prema Katoličkom lekcionaru (1998 USA Edition, Felix Just S.J. - catholic-resources.org) i unakrsno provjerene protiv gcatholic.org; hrvatska razlika od američke prakse - Tijelovo ostaje na četvrtak (nije premješteno na nedjelju). Svih **55/55 tekstova** čitanja (Šarić PD prijevod) popunjeno u četiri kruga (Došašće+Božić → kroz godinu prije korizme+korizma → vazmeno vrijeme+Duhovi/Trojstvo/Tijelovo → kroz godinu do kraja). Nekoliko dana s identičnim ABC čitanjima preuzeto izravno iz Godine A (Božić, Sveta Obitelj, 2. nedjelja po Božiću, Uskrs - Nedjelja Uskrsnuća, Duhovi, Velika Gospa, Svi Sveti; Krštenje je dobilo novo evanđelje Mk 1,7-11 uz preuzete ostale dijelove). Datoteka je upisana u `data-index.json` i `service-worker.js` cache popis - aplikacija sad automatski prikazuje ispravnu godinu (A ili B) ovisno o datumu.
- **provjeri.py** (21.7.2026.): mala skripta koja validira JSON sintaksu i osnovnu strukturu svih `data-godina-*.json` datoteka te provjerava da `APP_VERZIJA` (`js/verzija.js`) i `CACHE_NAME` (`service-worker.js`) imaju isti broj verzije. Pokreni je (`python provjeri.py`) prije SVAKOG pusha - izlazni kod 0 = sve u redu, 1 = ima grešaka (ne pushaj).

## Git i hosting (od 20.7.2026.)

- Mapa je pravi git repozitorij, povezan na `https://github.com/silviogajdosik-ops/kalendarmisa.git` (remote `origin`, grana `main`).
- GitHub Pages je uključen (Deploy from a branch → main → /root) → javni link: **https://silviogajdosik-ops.github.io/kalendarmisa/** (rješava i offline/service-worker problem bez lokalnog servera).
- Git credential (GitHub token) spremljen je u Windows Credential Manager preko `git-credential-manager`, tako da `git push`/`git pull` iz ove mape rade bez ponovnog unosa lozinke/tokena.
- Napomena: git operacije treba raditi iz stvarne Windows mape (kako je opisano gore), ne kroz Cowork-ov sandbox most prema mapi - taj most ne podržava git-ove zaključane/privremene datoteke pa git tamo ne radi ispravno.

## Otkriven i ispravljen bug (20.7.2026.)

Service Worker instalacija (`cache.addAll`) smjela je koristiti preglednikovu HTTP predmemoriju, pa bi pri prvoj instalaciji mogla "zamrznuti" zastarjelu verziju neke datoteke (npr. `data-godina-A.json`) ako ju je korisnik nedavno već dohvatio (čak i obično posjetom stranici prije instalacije PWA). Otkriveno testiranjem preko Chroma - dark tema i reference su se ažurirale, ali tekst čitanja je ostao star unatoč bump-u verzije, jer je `cache.addAll` ponovno pokupio isti (zastarjeli) HTTP-predmemorirani odgovor. Popravljeno u `service-worker.js`: svaka datoteka se sada ručno dohvaća s `{ cache: "reload" }` koji zaobilazi HTTP predmemoriju. CACHE_NAME je zbog toga na v4.

## Poznata ograničenja / stvari koje NISU riješene

1. **Ikone - RIJEŠENO** (21.7.2026.): generirane PNG verzije 192x192 i 512x512 (cairosvg u sandboxu) i dodane u `manifest.json` uz SVG; `apple-touch-icon` u `index.html` sada pokazuje na PNG.
2. **Service Worker ne radi preko `file://`** - riješeno za stvarnu upotrebu preko GitHub Pages linka gore; `pokreni.bat` ostaje korisan za lokalni razvoj/testiranje.
3. **Godina B - RIJEŠENO** (ažurirano 21.7.2026., verzija 1.2.0): `data-godina-B.json` ima svih 55 dana s potpunim referencama i tekstovima, upisan u `data-index.json` i `service-worker.js` cache popis.
4. **Reference i tekstovi čitanja - DOVRŠENO** (ažurirano 21.7.2026., backfill krug 5, završni): svih **55/55 dana** Godine A ima i biblijsku referencu i puni tekst čitanja (`tekst`/`pripjev`/`naslov`), popunjen iz Šarić (PD) prijevoda, od 2025-11-30 do 2026-11-22. Reference su sastavljene iz poznatog rasporeda Lekcionara za godinu A, nisu provjerene redak-po-redak protiv tiskanog misala - vrijedi provjeriti sitne razlike u podjeli stihova prije stvarnog čitanja u crkvi. "Molitva vjernika" ostaje namjerno prazna (korisnikova odluka - nije biblijski tekst nego pastoralno sastavljen, ne generira se automatski).
5. **Nije testirano na stvarnom mobitelu** - vrijedilo bi provjeriti instalaciju i offline rad na Androidu i iPhoneu.
6. **Nema automatske validacije JSON-a** - `data-godina-*.json` datoteke pišu se ručno pa vrijedi provjeriti da su i dalje ispravan JSON nakon svakog unosa teksta (npr. `python -m json.tool data-godina-A.json`).

## Verzioniranje (trenutno na verziji 1.2.0, ažurirano 21.7.2026.)

Aplikacija koristi semantičko verzioniranje **X.Y.Z**, vidljivo korisniku u podnožju appa (da može provjeriti ima li ažurnu verziju). Pravila: Z = ispravak greške (1.0.0 → 1.0.1); Y = nova/promijenjena mogućnost ili veći dodatak podataka, npr. nova liturgijska godina (→ 1.1.0, Z na 0); X = veliki redizajn/prerada (→ 2.0.0, Y i Z na 0). Detalji u `README.md` (odjeljak "Verzioniranje").

**Postupak objave - uvijek sva 3 koraka**: (1) `APP_VERZIJA` u `js/verzija.js`, (2) `CACHE_NAME` u `service-worker.js` na isti broj (`"kalendar-misa-1.0.1"`), (3) zapis u `PROMJENE.md`. Prije pusha uvijek pokreni `python provjeri.py` (provjerava upravo ovo dvoje + valjanost svih data-godina-*.json). Stari brojač cache-a v1-v13 je zamijenjen ovom shemom.

- **1.0.0** (21.7.2026.): tekstovi čitanja 55/55, PNG ikone, uvedeno verzioniranje.
- **1.1.0** (21.7.2026.): veličina fonta (A−/A+), Wake Lock (ekran se ne gasi), gumb "Danas", swipe lijevo/desno; dodana `provjeri.py`.
- **1.1.1** (21.7.2026.): zakrpa - veći gumbi u zaglavlju (44×44px dodirni cilj), swipe rub-zona 24px (izbjegava sudar s OS gestom natrag).
- **1.2.0** (21.7.2026.): Godina B potpuno popunjena (55/55 dana, reference + tekstovi) i uključena u aplikaciju (`data-index.json` + `service-worker.js` cache) - app sad automatski prikazuje ispravnu godinu (A ili B) po datumu.

## Sljedeći koraci (preporuke, ažurirano 21.7.2026.)

1. **Testiranje na mobitelu** (korisnik): instalacija, offline rad, novi gumbi (font/Wake Lock/Danas), swipe gesta i sada i prikaz Godine B na Androidu/iPhoneu preko https://silviogajdosik-ops.github.io/kalendarmisa/ - u podnožju treba pisati "Verzija 1.2.0".
2. Ako se naknadno uoče sitne razlike u podjeli stihova nasuprot tiskanom misalu (Godina A ili B), doraditi referenc-polja pojedinačno (zakrpa).
3. Za buduću liturgijsku godinu C `generiraj_godinu_b.py` je gotov predložak - algoritam za pokretne blagdane vrijedi za bilo koju godinu, samo treba promijeniti ulazni parametar godine i naziv izlazne datoteke.

Kritična pravila: git i brisanje datoteka u ovoj mapi rade se samo preko `mcp__Windows-MCP__PowerShell`, nikad kroz sandbox bash (čak i `git status` kroz sandbox zna ostaviti neobrisiv `index.lock`); službeni HBK prijevod se NE smije preuzimati - tekstovi isključivo iz Šarić (public domain) prijevoda; uvijek pokreni `python provjeri.py` prije pusha.

## Kako nastaviti kod kuće

1. Raspakiraj zip u novu mapu (npr. `Kalendar misa`).
2. U Coworku poveži tu mapu.
3. Zalijepi otprilike ovu poruku:

   > Nastavljam raditi na PWA projektu "Kalendar misa" iz priložene mape. Pročitaj `NASTAVAK-PROJEKTA.md` i `README.md` za kontekst. [ovdje napiši što točno želiš dalje - npr. "Pomozi mi unijeti tekstove čitanja za sljedeće tri nedjelje" ili "Generiraj PNG ikone" ili "Pripremi upute za postavljanje na Netlify"]

4. Ako je sandbox okruženje dostupno (bash/Python), dobra prilika je odmah zatražiti generiranje PNG ikona i/ili automatsku validaciju `data.json`.

## Testiranje promjena

Nakon svake izmjene bilo koje datoteke, objavi novu verziju po postupku iz odjeljka "Verzioniranje" gore (verzija.js + CACHE_NAME + PROMJENE.md). Inače će korisnici koji su već instalirali aplikaciju i dalje vidjeti staru (predmemoriranu) verziju.
