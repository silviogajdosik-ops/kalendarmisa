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
├── data-godina-A.json      PROMJENJIVI dio: čitanja po danu za liturgijsku godinu A (ovdje se lijepi tekst)
├── pokreni.bat             pokretanje lokalnog servera na Windowsu (dvoklik)
├── README.md                opće upute (hosting, popunjavanje čitanja, verzioniranje)
├── PROMJENE.md              changelog - zapis za svaku objavljenu verziju
├── NASTAVAK-PROJEKTA.md     ova datoteka
├── GIT-UPUTE-ZA-CLAUDEA.md  generičke upute za git/GitHub (reusable za buduće projekte)
├── css/style.css
├── js/
│   ├── verzija.js           APP_VERZIJA - broj verzije koji se prikazuje u podnožju appa
│   ├── app.js               logika: učitavanje, accordion prikaz, date picker, boje, dark tema
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
3. **Godina B nije unesena** - podaci idu samo do 22.11.2026. (kraj Godine A). Za nastavak nakon toga (od 29.11.2026., Godina B) treba dodati `data-godina-B.json` po istom obrascu i upisati je u `data-index.json`.
4. **Reference i tekstovi čitanja - DOVRŠENO** (ažurirano 21.7.2026., backfill krug 5, završni): svih **55/55 dana** Godine A ima i biblijsku referencu i puni tekst čitanja (`tekst`/`pripjev`/`naslov`), popunjen iz Šarić (PD) prijevoda, od 2025-11-30 do 2026-11-22. Reference su sastavljene iz poznatog rasporeda Lekcionara za godinu A, nisu provjerene redak-po-redak protiv tiskanog misala - vrijedi provjeriti sitne razlike u podjeli stihova prije stvarnog čitanja u crkvi. "Molitva vjernika" ostaje namjerno prazna (korisnikova odluka - nije biblijski tekst nego pastoralno sastavljen, ne generira se automatski).
5. **Nije testirano na stvarnom mobitelu** - vrijedilo bi provjeriti instalaciju i offline rad na Androidu i iPhoneu.
6. **Nema automatske validacije JSON-a** - `data-godina-*.json` datoteke pišu se ručno pa vrijedi provjeriti da su i dalje ispravan JSON nakon svakog unosa teksta (npr. `python -m json.tool data-godina-A.json`).

## Verzioniranje (od 21.7.2026., verzija 1.0.0)

Aplikacija koristi semantičko verzioniranje **X.Y.Z**, vidljivo korisniku u podnožju appa (da može provjeriti ima li ažurnu verziju). Pravila: Z = ispravak greške (1.0.0 → 1.0.1); Y = nova/promijenjena mogućnost ili veći dodatak podataka, npr. nova liturgijska godina (→ 1.1.0, Z na 0); X = veliki redizajn/prerada (→ 2.0.0, Y i Z na 0). Detalji u `README.md` (odjeljak "Verzioniranje").

**Postupak objave - uvijek sva 3 koraka**: (1) `APP_VERZIJA` u `js/verzija.js`, (2) `CACHE_NAME` u `service-worker.js` na isti broj (`"kalendar-misa-1.0.1"`), (3) zapis u `PROMJENE.md`. Stari brojač cache-a v1-v13 je zamijenjen ovom shemom.

## Sljedeći koraci (preporuke, ažurirano 21.7.2026.)

Tekstovi čitanja (55/55), PNG ikone i verzioniranje su **završeni**. Preostaje:

1. **Testiranje na mobitelu** (korisnik): instalacija i offline rad na Androidu/iPhoneu preko https://silviogajdosik-ops.github.io/kalendarmisa/ - u podnožju treba pisati "Verzija 1.0.0".
2. **Godina B**: nakon 22.11.2026. treba dodati `data-godina-B.json` po istom obrascu (reference + tekstovi) i upisati je u `data-index.json` - veći budući projekt, nije hitno. To će biti verzija 1.1.0.
3. Ako se naknadno uoče sitne razlike u podjeli stihova nasuprot tiskanom misalu, doraditi referenc-polja pojedinačno (zakrpa, npr. 1.0.1).

Kritična pravila: git i brisanje datoteka u ovoj mapi rade se samo preko `mcp__Windows-MCP__PowerShell`, nikad kroz sandbox bash (čak i `git status` kroz sandbox zna ostaviti neobrisiv `index.lock`); službeni HBK prijevod se NE smije preuzimati - tekstovi isključivo iz Šarić (public domain) prijevoda.

## Kako nastaviti kod kuće

1. Raspakiraj zip u novu mapu (npr. `Kalendar misa`).
2. U Coworku poveži tu mapu.
3. Zalijepi otprilike ovu poruku:

   > Nastavljam raditi na PWA projektu "Kalendar misa" iz priložene mape. Pročitaj `NASTAVAK-PROJEKTA.md` i `README.md` za kontekst. [ovdje napiši što točno želiš dalje - npr. "Pomozi mi unijeti tekstove čitanja za sljedeće tri nedjelje" ili "Generiraj PNG ikone" ili "Pripremi upute za postavljanje na Netlify"]

4. Ako je sandbox okruženje dostupno (bash/Python), dobra prilika je odmah zatražiti generiranje PNG ikona i/ili automatsku validaciju `data.json`.

## Testiranje promjena

Nakon svake izmjene bilo koje datoteke, objavi novu verziju po postupku iz odjeljka "Verzioniranje" gore (verzija.js + CACHE_NAME + PROMJENE.md). Inače će korisnici koji su već instalirali aplikaciju i dalje vidjeti staru (predmemoriranu) verziju.
