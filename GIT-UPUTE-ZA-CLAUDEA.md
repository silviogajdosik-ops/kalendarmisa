# Upute za Claudea: kako pristupiti Silviovom gitu i slati projekte na GitHub

Ova datoteka nije vezana samo uz "Kalendar misa" - kopiraj je u bilo koji budući projekt (ili je čitaj odavde) kad treba postaviti/koristiti git i GitHub. Piše za buduću instancu Claudea koja ne vidi ovaj razgovor.

## Osnovni podaci

- GitHub korisnik: **silviogajdosik-ops** (repozitoriji tipa `https://github.com/silviogajdosik-ops/<ime-repo>`)
- Git commit e-mail: `silvio.gajdosik@gmail.com`
- Windows račun: `desktop-b5bvp4a\silvi`
- `gh` (GitHub CLI) **nije instaliran** na ovom računalu - repozitorije treba stvarati preko web sučelja (github.com/new) ili preko Chroma (vidi dolje), ne preko `gh repo create`.

## Ključno ograničenje - PROČITAJ PRIJE NEGO POKRENEŠ GIT

Cowork sandbox (alat `mcp__workspace__bash`) vidi korisnikovu povezanu mapu preko FUSE mosta (`/sessions/.../mnt/<mapa>`). Taj most **ne podržava git ispravno** - `git init`/`commit`/`push` unutar te mape ostavljaju pokvarene, nebrisive `.git` zaključane datoteke ("Operation not permitted" na unlink/rename), jer FUSE most ne dopušta atomične rename/lock operacije koje git treba. Isti most **ne dopušta niti obično `rm` brisanje datoteka** (testirano - "Operation not permitted" i na obične datoteke, ne samo git).

**Zato: git operacije (i brisanje datoteka) nad korisnikovom stvarnom mapom uvijek radi preko `mcp__Windows-MCP__PowerShell` alata (pravi Windows PowerShell na njegovom računalu), NIKAD preko `mcp__workspace__bash`.**

Ako `mcp__Windows-MCP__PowerShell` nije učitan, prvo pozovi:
```
ToolSearch: query "select:mcp__Windows-MCP__PowerShell,mcp__Windows-MCP__FileSystem"
```

`mcp__workspace__bash` je i dalje koristan za sve što NIJE git/brisanje u toj mapi (čitanje/analiza podataka, generiranje PNG-ova, itd.) - samo git operacije i brisanje datoteka moraju ići preko PowerShell alata.

**Napomena o Write/Edit alatima:** nakon što nešto stvoriš u korisnikovoj mapi preko `Write` alata, provjeri preko PowerShell-a (`Test-Path`) da je datoteka stvarno ostala na disku prije nego se osloniš na nju u sljedećim koracima (npr. prije `git add`) - u jednoj sesiji se dogodilo da je datoteka nestala s diska bez očitog uzroka između poziva.

## Vjerodajnice (credentials) - već su postavljene

Na ovom računalu je globalno postavljeno:
```
git config --global credential.helper manager
```
i GitHub token je već spremljen u **Windows Credential Manager** (siguran OS-level spremnik, ne plain-text datoteka) za `host=github.com`, `username=silviogajdosik-ops`. To znači da `git push`/`git pull` prema BILO KOJEM repozitoriju na `github.com/silviogajdosik-ops/...` treba raditi bez ponovnog traženja tokena.

Provjeri prije nego tražiš novi token:
```powershell
git config --global credential.helper
```
Ako vrati `manager`, credential je vjerojatno već tu - samo probaj `git push` i vidi radi li. Traži novi Personal Access Token od korisnika SAMO ako push vrati auth grešku (401/403) - uputi ga: GitHub → profilna slika → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token, scope `repo`.

Ako dobiješ novi token, spremi ga OVAKO (u Credential Manager, ne u datoteku projekta):
```powershell
$cred = "protocol=https`nhost=github.com`nusername=silviogajdosik-ops`npassword=<TOKEN>`n`n"
$cred | git credential approve
```
Nakon toga token više ne spominji niti piši u commit poruke, datoteke ili memoriju.

## Postavljanje novog projekta kao git repozitorija

1. Provjeri/stvori repo na GitHubu ako još ne postoji (github.com/new, ili preko Chroma - vidi dolje).
2. U PowerShellu (stvarna Windows putanja projekta, ne sandbox mount):
```powershell
cd "C:\putanja\do\projekta"
git init -q
git config user.name "Silvio Gajdosik"
git config user.email "silvio.gajdosik@gmail.com"
git add -A
git commit -q -m "Initial commit"
git branch -M main
git remote add origin https://github.com/silviogajdosik-ops/<ime-repo>.git
git push -u origin main
```
3. Ako repo na GitHubu već ima commitove koji se razlikuju od lokalnih (npr. stvoren s README preko web sučelja), a lokalni sadržaj je "izvor istine": `git push --force -u origin main` (samo ako si siguran da je remote sadržaj zamjenjiv/prazan - inače prvo `git pull --rebase`).

## Stvaranje novog repozitorija ili uključivanje GitHub Pages preko Chroma

Kad treba nešto što ide preko GitHub web sučelja (novi repo, GitHub Pages, postavke), a nema API pristupa (sandbox bash ne može pogoditi `api.github.com` - blokiran je proxy allowlistom), koristi Claude in Chrome alate (korisnik mora biti ulogiran u GitHub u svom Chromeu):

```
ToolSearch: query "select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__find"
```

Za GitHub Pages: navigiraj na `https://github.com/silviogajdosik-ops/<ime-repo>/settings/pages`, postavi Source = "Deploy from a branch", Branch = `main`, folder `/(root)`, klikni Save. Rezultat: `https://silviogajdosik-ops.github.io/<ime-repo>/`.

Za novi repo: navigiraj na `https://github.com/new`, popuni ime i vidljivost (public/private), klikni "Create repository" - ostavi ga praznim (bez README-a) ako ćeš pushati postojeći lokalni projekt, da izbjegneš konflikt povijesti.

## Napomene

- Uvijek radi commit prije riskantnih operacija (`git status` pa `git add -A && git commit` ili `git stash -u`) prije `reset`/`checkout`/`clean`.
- Prije pushanja, provjeri `git status` nakon `git add -A` da slučajno ne uključiš tajne (tokene, lozinke, `.env` datoteke i sl.).
- Za PWA/service-worker projekte specifične konvencije (npr. bump verzije cache-a) traži u projekt-specifičnoj `NASTAVAK-PROJEKTA.md` datoteci tog projekta, ne ovdje - ova datoteka je namjerno generička za git/GitHub dio.
