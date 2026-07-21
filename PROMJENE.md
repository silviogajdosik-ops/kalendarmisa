# Povijest promjena (changelog)

Svaka objavljena verzija dobiva ovdje svoj zapis, najnovija na vrhu.
Pravila verzioniranja su opisana u `README.md` (odjeljak "Verzioniranje") i u `js/verzija.js`.

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
