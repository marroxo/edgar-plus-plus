# Edgar++

Dodatak jednim klikom povezuje otvoreni Edgarov zadatak s lokalnom C datotekom u VS Codeu. Ne predaje zadatak. Provjera se pokreće samo naredbom **Edgar: Pokreni provjeru**; Edgarov Run može spremiti odgovor i poslati ga na provjeru.

1. Otvori lokalnu mapu u VS Codeu i provjeri da je dodatak Edgar omogućen.
2. U izborniku dodatka **Edgar++** uključi **Omogući povezivanje s VS Codeom** i potvrdi odabir. Otvori vježbu i željeni zadatak pa klikni **VS Code · Spoji**.
3. Piši u VS Codeu ili Edgaru. Promjene se prenose u oba smjera bez automatskog pokretanja. Ako se obje strane različito izmijene prije sinkronizacije, prijenos se zaustavlja kako bi oba teksta ostala sačuvana. Za odspajanje ponovno klikni isti gumb.

Za međuispite i završne ispite prepoznaje godinu, termin i broj zadatka, npr. `MI2425B2.c`. Ostale vježbe dobivaju siguran opisni naziv. Datoteka se sprema u `00 - Moji programi` ako mapa postoji u otvorenom projektu, inače u `Edgar`. Novu datoteku započinje postojećim kodom u Edgaru. Za već spojeni zadatak pamti datoteku i ponovno je otvara. Pri spajanju s postojećom datotekom njezin trenutačni kod iz VS Codea prenosi se u Edgarov editor. Za drugi zadatak s istim nazivom stvara novu datoteku s nastavkom `_1`, `_2` i tako dalje. Kod se prenosi samo u jedan povezani zadatak; promjenom zadatka povezivanje prestaje.

Za preglednik koristi potpisani paket s [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/edgar-plus-plus/). Izvorni kod u direktoriju `firefox` možeš privremeno učitati za razvoj preko `about:debugging` → **This Firefox** → **Load Temporary Add-on** → `firefox/manifest.json`.

Za VS Code koristi [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=marroxo.edgar-spojenie). Ako si prethodno instalirao lokalnu verziju `local.edgar-spojenie`, onemogući je prije korištenja Marketplace verzije jer obje koriste isti lokalni priključak. Ručna instalacija dostupna je preko `.vsix` paketa u [GitHub izdanjima](https://github.com/marroxo/edgar-plus-plus/releases) i opcije **Extensions** → **Install from VSIX…**.

Opcija **Sakrij osobne podatke** u postavkama Edgar+ (zupčanik) zamagljuje zaglavlje s fotografijom i tekstom profila. Ista postavka dostupna je u izborniku dodatka.

Iz korijena repozitorija pokreni `node tests.js`, `node test-content.js` i `node vscode-tests.js`.

Dok je zadatak povezan, `Shift+Alt+F` u Edgarovu editoru formatira kod pomoću VS Codeova formattera za C. Ako izmjene još nisu sinkronizirane, pričekaj i ponovno pritisni prečac.

U izborniku Edgar+ → Theme dostupna je tema Burgundy Soft prema aktivnoj VS Code temi.

## Promjena boje

Klikni ikonu **Edgar++** na alatnoj traci preglednika. U odjeljku **Prikaz** uključi **Burgundy tema** za tamnu bordo temu ili isključi prekidač za povratak na izgled koji si odabrao u Edgaru ili Edgaru+.

### Kako dodati boje u izvornom kodu

U [firefox/content.js](firefox/content.js) pronađi CSS u varijabli `burgundyStyle`. Pravila pod `html.edgar-burgundy` primjenjuju se kad je prekidač **Burgundy tema** uključen.

| Što želiš promijeniti | Što pronaći u CSS-u |
| --- | --- |
| Zaglavlje i alatna traka | `--edgar-surface-header` |
| Primjeri ispisa i donja traka | `--edgar-surface-panel` |
| Pozadina stranice i editora | `--edgar-surface-page` i `--edgar-surface-editor` |
| Rubovi između površina | `--edgar-surface-edge` |
| Ključne riječi, nizovi znakova, brojevi i komentari | Parovi selektora `.ace_keyword` / `.cm-keyword`, `.ace_string` / `.cm-string`, `.ace_numeric` / `.cm-number` i `.ace_comment` / `.cm-comment` |

Primjerice, zamijeni `--edgar-surface-editor:#160D12;` s `--edgar-surface-editor:#181B24;` za plavosivu pozadinu editora. Za novu boju sintakse postavi isti `color` na oba odgovarajuća selektora. Edgar+ koristi Ace, a Edgarov ugrađeni editor koristi CodeMirror. Novo CSS pravilo dodaj u isti blok i ograniči ga selektorom `html.edgar-burgundy`.

- **Firefox i LibreWolf:** učitaj `firefox/manifest.json` preko `about:debugging` → **This Firefox** → **Load Temporary Add-on**. Nakon izmjene klikni **Reload** uz dodatak pa osvježi Edgar.
- **Chrome:** iz korijena repozitorija pokreni `python build-chrome.py --version 0.3.32`. Za izradu paketa treba Python s Pillowom (`python -m pip install Pillow`). Raspakiraj dobiveni ZIP u mapu koju si učitao preko **Load unpacked**, klikni **Reload** uz dodatak i osvježi Edgar.

## Chrome

1. Raspakiraj `edgar-plus-plus-chrome.zip` u mapu koju ćeš zadržati na istom mjestu.
2. U Chromeu otvori `chrome://extensions`, uključi **Developer mode** i klikni **Load unpacked**. Odaberi mapu u kojoj se nalazi `manifest.json`.
3. Za povezivanje s VS Codeom kopiraj ID s kartice Edgar++ na stranici dodataka. U korisničkim postavkama VS Codea upiši ga u `edgar.chromeExtensionId`. Zatim u izborniku Edgar++ uključi **Omogući povezivanje** i na zadatku klikni **VS Code · Spoji**.

Za ažuriranje raspakiraj novo izdanje u istu mapu, klikni **Reload** na kartici Edgar++ i osvježi Edgar.
