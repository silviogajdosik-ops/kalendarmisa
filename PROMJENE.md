# Povijest promjena (changelog)

Svaka objavljena verzija dobiva ovdje svoj zapis, najnovija na vrhu.
Pravila verzioniranja su opisana u `README.md` (odjeljak "Verzioniranje") i u `js/verzija.js`.

## 1.0.0 - 21.7.2026.

Prva potpuna verzija:

- Svih 55 dana liturgijske godine A (30.11.2025. - 22.11.2026.) ima biblijske reference i pune tekstove čitanja iz Šarić (public domain) prijevoda, uključujući naknadno popunjenu 1. nedjelju došašća koja je bila ostala na placeholderu.
- PNG ikone 192x192 i 512x512 (uz postojeći SVG) za bolju podršku instalacije, posebno na iOS-u.
- Broj verzije vidljiv u podnožju aplikacije (`js/verzija.js`); `CACHE_NAME` u service workeru od sada prati broj verzije (dosadašnji v1-v13 brojač je zamijenjen ovom shemom).
- Ranije značajke: dark tema s pamćenjem izbora, automatski odabir prvog nadolazećeg dana, liturgijske boje, toggle dugog/kratkog Vjerovanja, 100% offline rad (PWA), auto-reload na novu verziju service workera.
