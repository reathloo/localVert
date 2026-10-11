# Lokal Konverter

Browser-Erweiterung für lokale Datei-Konvertierung und -Optimierung in einem kleinen, eigenständigen Browserfenster. Die Verarbeitung läuft ausschließlich auf dem Gerät. Es gibt keine Uploads, Accounts oder Telemetrie.

Die Oberfläche erkennt die Browsersprache automatisch. Englisch ist die Standardsprache; Deutsch, Spanisch und Französisch sind ebenfalls enthalten. Für andere Sprachen wird Englisch verwendet. Über den kleinen Sprachknopf oben rechts kann man jederzeit „Automatisch“ oder eine Sprache manuell wählen; die Auswahl bleibt lokal gespeichert.

Das Farbschema folgt zunächst automatisch dem hellen oder dunklen Browser-/Systemdesign. Über das Mondsymbol oben rechts lassen sich „Automatisch“, „Hell“ oder „Dunkel“ wählen. Eine manuelle Auswahl wird nur lokal im Browser gespeichert.

## Funktionen

- JPG, PNG und WebP komprimieren und ineinander konvertieren; GIF (erstes Bild), TIFF (erste Seite), AVIF und HEIC als Eingaben. AVIF-Ausgabe und HEIC-Eingabe hängen vom Browser ab.
- Bei Bildern längste Kante, Drehung und mittigen quadratischen Zuschnitt einstellen. Neu kodierte Bilder enthalten keine ursprünglichen EXIF-Standortdaten; das Original bleibt unangetastet.
- Ein oder mehrere Bilder als PDF ausgeben; Transparenz wird weiß hinterlegt. PDF-Seiten als JPG/PNG in einem ZIP exportieren.
- PDF im schonenden Modus strukturerhaltend neu speichern, wenn dabei Platz gespart wird. PDFs mit erkennbaren Formularen/Signaturen sowie nicht kleinere Ergebnisse bleiben unverändert. Alternativ bildbasierte PDF neu erzeugen; auswählbaren PDF-Text als TXT exportieren.
- Für bildbasierte PDFs optional eine Zielgröße in MB angeben; bis zu drei Qualitätsstufen werden lokal getestet
- MP3, WAV, OGG/Opus und FLAC lokal umwandeln oder komprimieren, soweit der Browser die nötigen Codecs bereitstellt.
- MP4 und WebM lokal umwandeln oder komprimieren, soweit der Browser die nötigen Codecs bereitstellt.
- DOCX als TXT, das erste XLSX-Blatt als CSV, PPTX als TXT sowie DOCX/XLSX/PPTX als vereinfachtes PDF exportieren.
- Bis zu 20 Dateien gemeinsam auswählen oder hinzufügen und nacheinander lokal verarbeiten; Ausgabeformat und Download pro Datei oder ein gemeinsames ZIP bis 200 MB
- Optional nach einem Klick ein Ergebnis bis 2 MB in ein eindeutiges, passendes Datei-Upload-Feld der ursprünglich geöffneten Webseite einsetzen. localVert sendet es nicht selbst; die Webseite kann nach dem Einsetzen allerdings sofort einen Upload starten. Wenn kein passendes Feld gefunden wird, bleibt der normale Download verfügbar.
- Tatsächliche Größe und Vorher/Nachher-Vorschau der ersten PDF-Seite anzeigen
- Ergebnis lokal herunterladen

Die Formatliste hängt von der Eingabe und bei Medien von den Browser-Codecs ab. Der Regler steuert Bild-, PDF-, Audio- und Videoqualität; Office-Exporte bleiben davon unberührt. Die Zielgröße in MB gilt für einzelne Bild- oder PDF-Ausgaben und wird nach der Verarbeitung ehrlich als erreicht oder verfehlt angezeigt. Mehrere Bilder lassen sich zusätzlich zu einem PDF verbinden.

## Lokal testen

### Sofort im Browser ausprobieren

`test-browser.command` doppelklicken. Das zeigt die Popup-Oberfläche in Firefox auf `127.0.0.1`; Dateien bleiben lokal. Das Terminalfenster während des Tests geöffnet lassen. Dieser Schnelltest zeigt die Oberfläche, lädt aber noch keine Browser-Erweiterung.

### Als echte Erweiterung in Firefox testen

1. `test-addon-firefox.command` doppelklicken. Firefox öffnet `about:debugging` und Finder markiert `manifest.json`.
2. In Firefox „Temporäres Add-on laden“ wählen und die markierte `manifest.json` öffnen.
3. Auf das Symbol „Lokal Konverter“ klicken. Ein kleines Erweiterungsfenster öffnet sich ohne neuen Tab. Dort Datei auswählen, Ausgabeformat oder Komprimierung einstellen und Ergebnis herunterladen.

Temporäre Erweiterungen verschwinden beim Neustart von Firefox. Wenn Firefox bereits eine ältere Version von Lokal Konverter geladen hat, auf `about:debugging` bei dieser Erweiterung „Neu laden“ wählen. Für Chrome oder Edge `chrome://extensions` beziehungsweise `edge://extensions` öffnen, Entwicklermodus aktivieren und den Ordner `localVert project folder` als entpackte Erweiterung laden. Safari benötigt für die Verteilung eine Safari-Web-Extension-Verpackung.

Das Fenster bleibt auch beim Dateiauswählen offen. Ein erneuter Klick auf das Erweiterungssymbol bringt es wieder nach vorn. Beim Schließen während der Verarbeitung wird der laufende Vorgang abgebrochen; die Originaldatei bleibt unberührt.

## Tests

`pnpm install` und `pnpm run build:vendor` bauen die mitgelieferten, zur Laufzeit offline verfügbaren Bibliotheken. `node tests/fixtures.mjs tests/generated` erzeugt lokale Testdateien. Danach `test-browser.command` starten und unter `http://127.0.0.1:8765/tests/regression.html` auf „Run local fixtures“ klicken. Die Browser-Regression prüft die wichtigsten Bild-, PDF-, Office-, Audio- und Video-Pfade. `tests/generated/` und `node_modules/` sind nicht Teil der Erweiterung.

## Release-Vorbereitung

`python3 scripts/package_extension.py` erzeugt `dist/localvert-<version>.zip` aus den Erweiterungsdateien einschließlich der lokal gebündelten Medienbibliotheken und Lizenzen. `python3 -m unittest discover -s tests -p 'test_*.py'` prüft Inhalt und Reproduzierbarkeit. GitHub Actions prüft bei Pushes und Pull Requests; das CI-ZIP ist keine Store-Veröffentlichung.

Vor einer Store-Einreichung müssen die installierte Erweiterung in den Zielbrowsern getestet, die jeweiligen Store-Metadaten und Datenschutzangaben erstellt und die Versionsnummer in `manifest.json` erhöht werden. Für Firefox Manifest V3 ist zudem eine feste Add-on-ID erforderlich. Ein Git-Push aktualisiert keine Store-Installation.

## Grenzen und Datenschutz

Bildbasierte PDFs verlieren Textsuche, Links, Formulare, Vektoren und digitale Signaturen. Das wird vor der Verarbeitung angezeigt. Strukturerhaltendes Umspeichern ist bewusst vorsichtig, aber keine allgemeine PDF-Reparatur oder Garantie für jedes seltene PDF-Merkmal. Eine exakt vorgegebene Zielgröße kann nicht garantiert werden. Wenn das Ergebnis bei gleichem Format größer wird, wird ohne ausdrücklich gewählte Bildanpassung stattdessen das Original zum Download angeboten.

GIF und TIFF werden auf das erste Bild beziehungsweise die erste Seite reduziert. HEIC benötigt native Browser-Unterstützung; AVIF-Ausgabe nur, wenn der Browser sie kodieren kann. DOCX→TXT, XLSX→CSV und PPTX→TXT erhalten keine Originalformatierung; XLSX→CSV nimmt nur das erste Blatt. Office→PDF setzt Text als Bildseiten neu und kann Bilder, Tabellenlayout, Formeln, Foliengrafiken und Textsuche verlieren. PDF→TXT funktioniert nur mit auswählbarem Text, nicht mit Scans. Audio-/Video-Konvertierung hängt von den im Browser verfügbaren Decodern/Encodern ab; stark komprimierte oder unlesbare Dateien werden verständlich abgelehnt.

Dateien über 100 MB, PDFs über 200 Seiten, ZIP-Ausgaben über 200 MB und Office-Einträge über 25 MB unkomprimiert werden abgelehnt. Die optionale Upload-Feld-Hilfe benötigt die Erweiterungsrechte `activeTab` und `scripting`; sie greift nur auf die per Klick aktivierte Seite zu und kann bei mehreren Feldern oder browsergeschützten Seiten scheitern. Die Erweiterung bündelt PDF.js (Apache-2.0), pdf-lib (MIT), Mediabunny und MP3-Encoder (MPL-2.0) sowie UTIF (MIT) lokal; die Lizenzen liegen unter `vendor/`. Zur Laufzeit wird keine Bibliothek von einem Server geladen.
