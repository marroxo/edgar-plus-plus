# Edgar++

Dodatak jednim klikom povezuje otvoreni Edgarov zadatak s lokalnom C datotekom u VS Codeu. Ne predaje zadatak. Provjera se pokreće samo naredbom **Edgar: Pokreni provjeru**; Edgarov Run može spremiti odgovor i poslati ga na provjeru.

1. Otvori lokalnu mapu u VS Codeu i provjeri da je dodatak Edgar omogućen.
2. U LibreWolfu otvori vježbu i željeni zadatak, zatim pokraj Zooma klikni **VS Code · Spoji**.
3. Piši u VS Codeu ili Edgaru. Promjene se prenose u oba smjera bez automatskog pokretanja. Ako se obje strane različito izmijene prije sinkronizacije, prijenos se zaustavlja kako bi oba teksta ostala sačuvana. Za odspajanje ponovno klikni isti gumb.

Za međuispite i završne ispite prepoznaje godinu, termin i broj zadatka, npr. `MI2425B2.c`. Ostale vježbe dobivaju siguran opisni naziv. Datoteka se sprema u `00 - Moji programi` ako mapa postoji u otvorenom projektu, inače u `Edgar`. Novu datoteku započinje postojećim kodom u Edgaru. Za već spojeni zadatak pamti datoteku i ponovno je otvara. Pri spajanju s postojećom datotekom njezin trenutačni kod iz VS Codea prenosi se u Edgarov editor. Za drugi zadatak s istim nazivom stvara novu datoteku s nastavkom `_1`, `_2` i tako dalje. Kod se prenosi samo u jedan povezani zadatak; promjenom zadatka povezivanje prestaje.

Za preglednik koristi potpisani paket s [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/edgar-plus-plus/). Izvorni kod u direktoriju `firefox` možeš privremeno učitati za razvoj preko `about:debugging` → **This Firefox** → **Load Temporary Add-on** → `firefox/manifest.json`.

Za VS Code preuzmi `.vsix` iz [GitHub izdanja](https://github.com/marroxo/edgar-plus-plus/releases) pa u VS Codeu otvori **Extensions** → **Install from VSIX…**. Za lokalno pokretanje C primjera potreban je GCC na putanji `PATH`.

Opcija **Sakrij osobne podatke** u postavkama Edgar+ (zupčanik) zamagljuje zaglavlje s fotografijom i tekstom profila. Ista postavka dostupna je u izborniku dodatka.

Iz korijena repozitorija pokreni `node tests.js`, `node test-content.js`, `node vscode-tests.js` i `node --test vscode/local-tests.test.js`. Posljednja provjera koristi GCC.

Dok je zadatak povezan, `Shift+Alt+F` u Edgarovu editoru formatira kod pomoću VS Codeova formattera za C. Ako izmjene još nisu sinkronizirane, pričekaj i ponovno pritisni prečac.

U izborniku Edgar+ → Theme dostupna je tema Burgundy Soft prema aktivnoj VS Code temi.
