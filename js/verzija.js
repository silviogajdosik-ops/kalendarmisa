/**
 * verzija.js - JEDINO mjesto gdje se mijenja broj verzije aplikacije.
 *
 * Shema (semantičko verzioniranje X.Y.Z):
 *   Z (zakrpa)   - ispravak greške, sitna korekcija teksta       -> 1.0.0 -> 1.0.1
 *   Y (mogućnost) - nova ili promijenjena mogućnost, novi podaci -> 1.0.1 -> 1.1.0 (Z se resetira na 0)
 *   X (velika)   - veliki redizajn / prerada aplikacije           -> 1.1.0 -> 2.0.0 (Y i Z se resetiraju na 0)
 *
 * VAŽNO pri svakoj promjeni verzije:
 *   1. promijeni APP_VERZIJA ovdje,
 *   2. promijeni CACHE_NAME u service-worker.js na ISTI broj (npr. "kalendar-misa-1.0.1"),
 *   3. dodaj zapis u PROMJENE.md.
 */
const APP_VERZIJA = "1.8.0";
