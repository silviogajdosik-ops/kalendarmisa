# Povijest promjena (changelog)

Svaka objavljena verzija dobiva ovdje svoj zapis, najnovija na vrhu.
Pravila verzioniranja su opisana u `README.md` (odjeljak "Verzioniranje") i u `js/verzija.js`.

## 1.4.0 - 21.7.2026.

Reorganiziran odabir dana - stari `<select>` sa 110+ ravnih stavki (nepregledan čak i s optgroup grupiranjem iz 1.3.0) zamijenjen je novim dizajnom:

- **Uklonjen nativni `<select>`**: umjesto njega, uz day-info traku sada stoje veliki gumbi ◀ / ▶ (44×44 px, SVG ikone) za prethodni/sljedeći dan - rade isto što i swipe, ali su vidljivi i otkriveni starijim korisnicima koji geste ne isprobavaju sami. Gumb "Danas" ostaje na istom mjestu.
- **Novi izbornik dana (bottom-sheet modal)**: dodir na day-info traku (sad je to gumb s ▾ ikonom) otvara izbornik preko ~90% ekrana. Stavke su grupirane po mjesecima (npr. "Kolovoz 2026.") s liturgijskom bojom (točkica) i nazivom svetkovine uz svaki dan. Prošli dani su sklopljeni iza jedne stavke "Prikaži prošle dane (N)" na vrhu - zadano se vidi samo od danas nadalje, čime popis pada s 110+ na ~50-ak stavki. Pri otvaranju se izbornik automatski skrola na današnji/prvi nadolazeći dan (vizualno istaknut), a trenutno prikazani dan ima kvačicu.
- **Pristupačnost izbornika**: `role="dialog"`, `aria-modal="true"`, fokus-trap (Tab kruži unutar panela), zatvaranje na X, Escape ili dodir izvan panela (na tamnu pozadinu iznad sheeta), fokus se nakon zatvaranja vraća na day-info gumb. Animacija otvaranja/zatvaranja poštuje `prefers-reduced-motion`.
- Sve postojeće funkcije provjerene i i dalje rade: swipe lijevo/desno, gumb "Danas", banner isteka podataka, oznaka "DANAS"/"za N dana" u day-info traci.
- Bez vanjskih biblioteka - čisti HTML/CSS/JS, radi offline, u obje teme i sa svim veličinama fonta (relativne jedinice, CSS varijable).

## 1.3.0 - 21.7.2026.

UX poboljšanja nakon pregleda uživo objavljene verzije:

- **Banner isteka podataka**: ako današnji datum prijeđe zadnji dan u podacima, na vrhu se prikazuje jasan crveni banner ("Podaci pokrivaju razdoblje do ... - potrebno je ažuriranje aplikacije") umjesto tihog prikaza zadnjeg dostupnog dana; žuti banner-najava pojavljuje se 30 dana prije tog isteka.
- **Oznaka "DANAS" / "za N dana"**: u day-info traci sada jasno piše je li prikazani dan danas ili nadolazeći (npr. "za 4 dana", "sutra"), ili prošli ("prije N dana", "jučer") - korisnik koji otvori app usred tjedna odmah zna zašto vidi nedjelju.
- **Skrolanje na vrh + animacija pri promjeni dana**: swipe, odabir iz izbornika ili gumb "Danas" sada automatski vrate sadržaj na vrh (bez toga korisnik ostaje usred stranice) i dodaju suptilnu slide/fade animaciju; sve poštuje `prefers-reduced-motion`.
- **Grupiran padajući izbornik**: 110+ stavki sada je grupirano `<optgroup>` oznakama po liturgijskoj godini i vremenu (Došašće, Božićno vrijeme, Korizma, Vazmeno vrijeme, Kroz godinu) umjesto jednog dugog ravnog popisa.
- **"Otvori sve / Zatvori sve" po sekciji** + **"Način mise"**: svaka sekcija reda mise ima gumb za brzo otvaranje/zatvaranje svih svojih stavki; traka "Način mise" (ispod zaglavlja) automatski širi sve stavke sekcije čim se ona otvori - korisno u crkvi gdje je zamorno otvarati stavku po stavku.
- **SVG ikone umjesto emoji**: gumbi za temu (mjesec/sunce) i Wake Lock (oko/prekriženo oko) sada koriste inline SVG umjesto emoji znakova (🌙/☀, 🔆/🔅) koji su se različito renderirali po uređajima; stanje uključeno/isključeno Wake Locka sada je vidljivo i kroz oblik ikone (ne samo boju) i kroz prigušenu prozirnost.
- **WCAG AA kontrast liturgijskih boja**: izmjerena kontrastna omjera svih 4 liturgijske boje u obje teme - zlatna/bijela boja (`#b6912a`) imala je samo ~2.97:1 na bijeloj pozadini (ne prolazi AA prag 4.5:1), pa je za pozadine potamnjena na `#8a6d16` (~4.9:1); dodana zasebna `--akcent-tekst` CSS varijabla s nijansama prilagođenim po temi (svjetlije u tamnoj temi) za tekstualne uporabe (naslovi sekcija, pripjev).
- **Generator za buduće liturgijske godine**: `generiraj_godinu_b.py` generaliziran u `generiraj-godinu.py` (parametri: godina došašća, slovo ciklusa); pokrenut za Godinu C i izlaz unakrsno provjeren protiv liturgijskog kalendara Hrvatske biskupske konferencije na gcatholic.org (2027/2028) - svi pokretni datumi i redni brojevi "kroz godinu" se točno podudaraju. Kostur `data-godina-C.json` (57 dana, 28.11.2027. - 26.11.2028., samo datumi/nazivi/boje, bez tekstova) dodan u projekt, ali JOŠ NIJE upisan u `data-index.json`/`service-worker.js` - slijedi tek nakon što se popune tekstovi čitanja.

## 1.2.0 - 21.7.2026.

Godina B (liturgijski ciklus B) sada je potpuna i uključena u aplikaciju:

- Svih 55 dana liturgijske godine B (29.11.2026. - 21.11.2027.) ima biblijske reference i pune tekstove čitanja iz Šarić (public domain) prijevoda.
- `data-godina-B.json` dodan u `data-index.json` i u service workerovu predmemoriju - aplikacija sad automatski prikazuje ispravnu godinu (A ili B) ovisno o datumu.

## 1.1.1 - 21.7.2026.

Zakrpa nakon pregleda uživo objavljene verzije (Chrome):

- **Veći gumbi u zaglavlju**: A−/A+, Wake Lock i tema toggle povećani sa 32×32 na 44×44 px (preporučeni minimalni dodirni cilj) - lakše pogađanje za starije korisnike i u crkvi gdje je pažnja podijeljena.
- **Swipe rub-zona**: dodiri koji krenu unutar 24px od lijevog/desnog ruba ekrana se sada ignoriraju, da se swipe za promjenu dana ne sudara sa sistemskom gestom "natrag" na iOS-u/Androidu.

## 1.1.0 - 21.7.2026.

Nove mogućnosti za korištenje uživo u crkvi:

- **Podesiva veličina fonta**: gumbi A− / A+ u zaglavlju, 4 koraka (15/17/19/21 px), izbor se pamti u `localStorage` (`fontIndeks`) i primjenjuje bez bljeska pri sljedećem otvaranju.
- **Wake Lock (ekran se ne gasi)**: dok je aplikacija otvorena, ekran ostaje uključen (Wake Lock API); gumb 🔆/🔅 u zaglavlju za ručno isključivanje; ako preglednik ne podržava Wake Lock, gumb se jednostavno sakrije (uredan fallback); ponovno se traži nakon povratka u aplikaciju (`visibilitychange`).
- **Gumb "Danas"**: uz padajući izbornik, brzi povratak na prvi nadolazeći dan nakon ručnog listanja.
- **Swipe lijevo/desno**: dodirom prstom po glavnom sadržaju prelazi se na prethodni/sljedeći dan (uz postojeći izbornik, ne umjesto njega).

## 1.0.0 - 21.7.2026.

Prva potpuna verzija:

- Svih 55 dana liturgijske godine A (30.11.2025. - 22.11.2026.) ima biblijske reference i pune tekstove čitanja iz Šarić (public domain) prijevoda, uključujući naknadno popunjenu 1. nedjelju došašća koja je bila ostala na placeholderu.
- PNG ikone 192x192 i 512x512 (uz postojeći SVG) za bolju podršku instalacije, posebno na iOS-u.
- Broj verzije vidljiv u podnožju aplikacije (`js/verzija.js`); `CACHE_NAME` u service workeru od sada prati broj verzije (dosadašnji v1-v13 brojač je zamijenjen ovom shemom).
- Ranije značajke: dark tema s pamćenjem izbora, automatski odabir prvog nadolazećeg dana, liturgijske boje, toggle dugog/kratkog Vjerovanja, 100% offline rad (PWA), auto-reload na novu verziju service workera.
