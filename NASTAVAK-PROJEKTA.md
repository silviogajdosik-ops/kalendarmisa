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
- **Auto-detekcija dana**: aplikacija pri otvaranju sama pronađe prvi datum ≥ danas i prikaže ga; korisnik može ručno birati prev/next gumbima, swipeom ili preko modalnog izbornika dana (dodir na day-info traku - vidi "Novi izbornik dana - verzija 1.4.0" niže; stari padajući `<select>` je uklonjen u 1.4.0).
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

## UX poboljšanja - verzija 1.3.0 (21.7.2026.)

- **Banner isteka podataka**: `azurirajBannerIsteka()` u `js/app.js` uspoređuje `danasYMD()` sa zadnjim datumom u spojenim podacima (`svi_dani`). Ako je danas prošao zadnji dan → crveni banner `#expiryBanner` (klasa `expiry-banner--expired`, "potrebno je ažuriranje aplikacije"). Ako je unutar 30 dana od isteka → žuti banner (`--soon`, s brojem preostalih dana). Poziva se jednom nakon učitavanja podataka (u `init()`), ne po promjeni dana.
- **Badge "DANAS"/"za N dana"/"prije N dana"**: `azurirajOznakuDana(dan)` računa razliku dana između danas i prikazanog datuma (`brojDanaIzmedju`) i postavlja tekst/klasu `#dayBadge` u day-info traci. Poziva se iz `prikaziDan()`.
- **Scroll na vrh + animacija**: `prikaziDan(dan, vrstaAnimacije)` sad prima drugi parametar ("next"/"prev"/"fade"). Kad je proslijeđen, poziva `window.scrollTo({top:0, behavior:...})` (poštuje `prefers-reduced-motion`) i dodaje CSS animacijsku klasu (`mass-order--anim-next/prev/fade`, definirane u `style.css` s `@media (prefers-reduced-motion: reduce)` isključenjem). Swipe lijevo/desno šalje "next"/"prev" (smjer klizanja), odabir iz izbornika i gumb "Danas" šalju "fade". Prvi prikaz pri učitavanju stranice NE animira (poziva se bez drugog argumenta).
- **Optgroup grupiranje**: `popuniSelect()` grupira opcije po ključu `godinaCiklusa + "|" + vrijeme` u `<optgroup>` elemente (label npr. "Godina A - Došašće"). Mapa `VRIJEME_LABEL` prevodi `vrijeme` polje (dosasce/bozicno/korizma/vazmeno/krozGodinu) u čitljiv naziv. Napomena: "Kroz godinu" prije korizme i poslije Duhova/Tijelova spaja se u JEDNU optgroup skupinu (HTML ne podržava ugniježđene optgroupove) - datumi unutra ostaju kronološki.
- **"Otvori sve/Zatvori sve" po sekciji + "Način mise"**: svaka `<details class="section">` sad ima kontrolnu traku (`sekcijaWrapper()` u `app.js`) s gumbom `data-section-toggle` - klik delegiran preko jednog listenera na `#massOrder` (`inicijalizirajKontroleSekcija()`). Traka `#nacinMiseCheckbox` (ispod zaglavlja, `nacinMiseAktivan` u `localStorage`) automatski širi sve stavke sekcije čim se ona otvori (`toggle` event, capture=true jer ne bubbla) - korisno u crkvi.
- **SVG ikone**: gumbi teme (mjesec/sunce) i Wake Lock (oko/prekriženo oko) sad koriste inline SVG (`IKONA_MJESEC/SUNCE/OKO/OKO_PREKRIZENO` konstante u `app.js`) umjesto emoji (🌙/☀/🔆/🔅) - dosljedan izgled na svim uređajima. Isključeni Wake Lock dodatno ima klasu `wake-toggle--iskljuceno` (prigušena prozirnost) - stanje se ne oslanja samo na oblik ikone.
- **WCAG AA kontrast**: izmjeren kontrast svih 4 liturgijske boje (formula WCAG relativne luminance) - "bijela" (zlatna) `#b6912a` imala je samo ~2.97:1 na bijeloj/s bijelim tekstom (ne prolazi AA prag 4.5:1 za tekst, ni 3:1 za veliki tekst pouzdano). Pozadinska varijanta (`BOJA_HEX.bijela` u `app.js`) potamnjena na `#8a6d16` (~4.9:1, koristi se za zaglavlje/aktivne gumbe s bijelim tekstom, ista u obje teme). Dodana zasebna CSS varijabla `--akcent-tekst` (postavlja je `postaviBoju()` iz tablice `BOJA_HEX_TEKST[temaIzbor]`) za tekstualne uporabe (naslovi sekcija, pripjev) - u tamnoj temi koristi svjetlije nijanse (npr. bijela/zlatna → `#caa04a`) jer originalne boje ne prolaze AA na tamnoj pozadini. Ostale 3 boje (ljubičasta/crvena/zelena) prolazile su AA na svijetloj pozadini, ali NE na tamnoj pozadini kao tekst - i za njih su dodane svjetlije "tekst" inačice za tamnu temu.
- **Generator budućih godina**: `generiraj_godinu_b.py` generaliziran u `generiraj-godinu.py` (parametri: godina došašća + slovo ciklusa, npr. `python generiraj-godinu.py 2027 C`). Pokrenut za Godinu C, izlazni kostur `data-godina-C.json` (57 dana, 28.11.2027. - 26.11.2028., samo datumi/nazivi/boje/rang, tekstovi prazni) unakrsno provjeren 21.7.2026. protiv liturgijskog kalendara Hrvatske biskupske konferencije na gcatholic.org/calendar/2027/HR-hr i .../2028/HR-hr - svi pokretni datumi (Uskrs, Duhovi, Trojstvo, Tijelovo, Krštenje, Pepelnica, Cvjetnica) i redni brojevi "nedjelja kroz godinu" se točno podudaraju. **VAŽNO**: `data-godina-C.json` JOŠ NIJE upisan u `data-index.json` ni u `service-worker.js` cache popis - to je sljedeći korak istom procedurom kao Godina B, tek nakon što se popune tekstovi čitanja (Šarić prijevod).

## Novi izbornik dana - verzija 1.4.0 (21.7.2026.)

Nativni `<select>` (110+ ravnih stavki, nepregledan čak i s optgroup grupiranjem iz 1.3.0) potpuno je uklonjen i zamijenjen:

- **Prev/next gumbi** (`prevDanBtn`/`nextDanBtn`, 44×44px, SVG ikone) u `day-picker__row` uz gumb "Danas" - rade isto što i swipe (`idiNaSusjedniDan(-1)`/`(1)`).
- **day-info je sada `<button>`** (ne `<div>`) s ▾ ikonom (`.day-info__chevron`) - dodir/klik otvara modal izbornik dana (`otvoriIzbornikDana()` u `app.js`).
- **Modal izbornik dana** (`#dayModalBackdrop` > `#dayModal`, `role="dialog"` `aria-modal="true"`): bottom-sheet preko ~90vh (namjerno ne 100% - ostavljen tanki trak pozadine na vrhu za "zatvori dodirom izvan panela"). Sadržaj gradi `izgradiPopisDanaZaIzbornik()` **iznova pri svakom otvaranju** (prošli dani se uvijek počinju sklopljeni):
  - `dodajStavkeGrupiranePoMjesecu()` grupira stavke po mjesecu (naslov npr. "KOLOVOZ 2026.", nominativ iz `MJESECI_NOMINATIV`), svaka stavka ima točkicu liturgijske boje (`BOJA_HEX`), naziv, kratki datum, zapovjedna oznaka.
  - Dani prije "zadanog dana" (danas/prvi nadolazeći, ista funkcija `odaberiZadaniDan()`) skriveni su iza gumba "Prikaži prošle dane (N)" na vrhu popisa - klik samo togglea `hidden` na već izgrađenom kontejneru (bez ponovnog gradnje), pa se stanje ne gubi.
  - Pri otvaranju: `scrollIntoView({block:"center"})` na stavku s klasom `.day-modal__item--danas` (zadani dan - scroll cilj je UVIJEK zadani dan, ne nužno trenutno prikazani dan); trenutno prikazani dan (`trenutniDan`) dodatno dobiva kvačicu (`.day-modal__item-check`, `aria-current="true"`) ako se razlikuje od zadanog.
  - Fokus-trap (`obradiTipkuModala`, Tab/Shift+Tab kruži unutar `#dayModal`), Escape zatvara, klik na pozadinu (`e.target === backdrop`) zatvara, fokus se nakon zatvaranja vraća na element koji je bio fokusiran prije otvaranja (ili na `#dayInfo`).
  - Animacija otvaranja/zatvaranja (`transform: translateY` + `opacity`) poštuje `prefers-reduced-motion` (isključena ako korisnik traži manje pokreta).
- **Sve staro i dalje radi**: swipe, gumb "Danas", banner isteka, badge "DANAS"/"za N dana" - nijedna od tih funkcija nije dirana, samo je uklonjen `<select>` i `popuniSelect()`.

## Verzioniranje (trenutno na verziji 1.4.0, ažurirano 21.7.2026.)

Aplikacija koristi semantičko verzioniranje **X.Y.Z**, vidljivo korisniku u podnožju appa (da može provjeriti ima li ažurnu verziju). Pravila: Z = ispravak greške (1.0.0 → 1.0.1); Y = nova/promijenjena mogućnost ili veći dodatak podataka, npr. nova liturgijska godina (→ 1.1.0, Z na 0); X = veliki redizajn/prerada (→ 2.0.0, Y i Z na 0). Detalji u `README.md` (odjeljak "Verzioniranje").

**Postupak objave - uvijek sva 3 koraka**: (1) `APP_VERZIJA` u `js/verzija.js`, (2) `CACHE_NAME` u `service-worker.js` na isti broj (`"kalendar-misa-1.0.1"`), (3) zapis u `PROMJENE.md`. Prije pusha uvijek pokreni `python provjeri.py` (provjerava upravo ovo dvoje + valjanost svih data-godina-*.json). Stari brojač cache-a v1-v13 je zamijenjen ovom shemom.

- **1.0.0** (21.7.2026.): tekstovi čitanja 55/55, PNG ikone, uvedeno verzioniranje.
- **1.1.0** (21.7.2026.): veličina fonta (A−/A+), Wake Lock (ekran se ne gasi), gumb "Danas", swipe lijevo/desno; dodana `provjeri.py`.
- **1.1.1** (21.7.2026.): zakrpa - veći gumbi u zaglavlju (44×44px dodirni cilj), swipe rub-zona 24px (izbjegava sudar s OS gestom natrag).
- **1.2.0** (21.7.2026.): Godina B potpuno popunjena (55/55 dana, reference + tekstovi) i uključena u aplikaciju (`data-index.json` + `service-worker.js` cache) - app sad automatski prikazuje ispravnu godinu (A ili B) po datumu.
- **1.3.0** (21.7.2026.): UX poboljšanja - banner isteka podataka, badge "DANAS"/"za N dana", scroll-na-vrh + animacija pri promjeni dana, optgroup grupiranje u day-selectu, "Otvori sve/Zatvori sve" po sekciji + "Način mise", SVG ikone umjesto emoji, WCAG AA kontrast liturgijskih boja (nova `--akcent-tekst` varijabla po temi), generalizirani generator `generiraj-godinu.py` + kostur Godine C (`data-godina-C.json`, još nije uključen u app).
- **1.4.0** (21.7.2026.): nativni `<select>` (čak i s optgroup grupiranjem iz 1.3.0 i dalje nepregledan) potpuno uklonjen - zamijenjen prev/next gumbima uz "Danas" i modalom (bottom-sheet) koji se otvara dodirom na day-info traku, grupiran po mjesecima, s prošlim danima sklopljenim po zadanome. Detalji u odjeljku "Novi izbornik dana - verzija 1.4.0" gore.

## Sljedeći koraci (preporuke, ažurirano 21.7.2026.)

1. **Testiranje na mobitelu** (korisnik): instalacija, offline rad, novi izbornik dana iz 1.4.0 (prev/next gumbi, dodir na day-info, bottom-sheet, "Prikaži prošle dane", scroll na danas) te sve UX novosti iz 1.3.0 (banner isteka, badge, scroll+animacija, "Otvori sve"/"Način mise", SVG ikone) na Androidu/iPhoneu preko https://silviogajdosik-ops.github.io/kalendarmisa/ - u podnožju treba pisati "Verzija 1.4.0". Posebno provjeriti dodir izvan panela na uskom mobilnom ekranu (tanki trak pozadine na vrhu bottom-sheeta) i fokus-trap ako se koristi vanjska tipkovnica.
2. Ako se naknadno uoče sitne razlike u podjeli stihova nasuprot tiskanom misalu (Godina A ili B), doraditi referenc-polja pojedinačno (zakrpa).
3. **Godina C - sljedeći korak**: kostur `data-godina-C.json` je gotov i datumski provjeren (vidi gore) - preostaje popuniti reference i tekstove čitanja (Šarić prijevod, isti postupak kao za Godinu B) i tek onda dodati datoteku u `data-index.json` + `service-worker.js` cache popis (uz bump verzije).

Kritična pravila: git i brisanje datoteka u ovoj mapi rade se samo preko `mcp__Windows-MCP__PowerShell`, nikad kroz sandbox bash (čak i `git status` kroz sandbox zna ostaviti neobrisiv `index.lock`); službeni HBK prijevod se NE smije preuzimati - tekstovi isključivo iz Šarić (public domain) prijevoda; uvijek pokreni `python provjeri.py` prije pusha.

## Kako nastaviti kod kuće

1. Raspakiraj zip u novu mapu (npr. `Kalendar misa`).
2. U Coworku poveži tu mapu.
3. Zalijepi otprilike ovu poruku:

   > Nastavljam raditi na PWA projektu "Kalendar misa" iz priložene mape. Pročitaj `NASTAVAK-PROJEKTA.md` i `README.md` za kontekst. [ovdje napiši što točno želiš dalje - npr. "Pomozi mi unijeti tekstove čitanja za sljedeće tri nedjelje" ili "Generiraj PNG ikone" ili "Pripremi upute za postavljanje na Netlify"]

4. Ako je sandbox okruženje dostupno (bash/Python), dobra prilika je odmah zatražiti generiranje PNG ikona i/ili automatsku validaciju `data.json`.

## Testiranje promjena

Nakon svake izmjene bilo koje datoteke, objavi novu verziju po postupku iz odjeljka "Verzioniranje" gore (verzija.js + CACHE_NAME + PROMJENE.md). Inače će korisnici koji su već instalirali aplikaciju i dalje vidjeti staru (predmemoriranu) verziju.
