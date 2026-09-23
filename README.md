# Lokal Konverter

Browser-Erweiterung für lokale Bild- und PDF-Komprimierung in einem kleinen, eigenständigen Browserfenster. Die Verarbeitung läuft ausschließlich auf dem Gerät. Es gibt keine Uploads, Accounts oder Telemetrie.

Die Oberfläche erkennt die Browsersprache automatisch. Englisch ist die Standardsprache; Deutsch, Spanisch und Französisch sind ebenfalls enthalten. Für andere Sprachen wird Englisch verwendet. Über den kleinen Sprachknopf oben rechts kann man jederzeit „Automatisch“ oder eine Sprache manuell wählen; die Auswahl bleibt lokal gespeichert.

## Funktionen

- JPG, PNG und WebP per Dateiauswahl oder Drag-and-drop komprimieren
- Bilder lokal in JPEG, WebP oder PNG ausgeben
- PDF im Modus „Qualität erhalten“ unverändert behalten oder als bildbasierte PDF neu erzeugen
- Für bildbasierte PDFs optional eine Zielgröße in MB angeben; bis zu drei Qualitätsstufen werden lokal getestet
- Tatsächliche Größe und Vorher/Nachher-Vorschau der ersten PDF-Seite anzeigen
- Ergebnis lokal herunterladen

## Lokal testen

### Sofort im Browser ausprobieren

`test-browser.command` doppelklicken. Das zeigt die Popup-Oberfläche in Firefox auf `127.0.0.1`; Dateien bleiben lokal. Das Terminalfenster während des Tests geöffnet lassen. Dieser Schnelltest zeigt die Oberfläche, lädt aber noch keine Browser-Erweiterung.

### Als echte Erweiterung in Firefox testen

1. `test-addon-firefox.command` doppelklicken. Firefox öffnet `about:debugging` und Finder markiert `manifest.json`.
2. In Firefox „Temporäres Add-on laden“ wählen und die markierte `manifest.json` öffnen.
3. Auf das Symbol „Lokal Konverter“ klicken. Ein kleines Erweiterungsfenster öffnet sich ohne neuen Tab. Dort Datei auswählen, Ausgabeformat oder Komprimierung einstellen und Ergebnis herunterladen.

Temporäre Erweiterungen verschwinden beim Neustart von Firefox. Wenn Firefox bereits eine ältere Version von Lokal Konverter geladen hat, auf `about:debugging` bei dieser Erweiterung „Neu laden“ wählen. Für Chrome oder Edge `chrome://extensions` beziehungsweise `edge://extensions` öffnen, Entwicklermodus aktivieren und den Ordner `localVert project folder` als entpackte Erweiterung laden. Safari benötigt für die Verteilung eine Safari-Web-Extension-Verpackung.

Das Fenster bleibt auch beim Dateiauswählen offen. Ein erneuter Klick auf das Erweiterungssymbol bringt es wieder nach vorn. Beim Schließen während der Verarbeitung wird der laufende Vorgang abgebrochen; die Originaldatei bleibt unberührt.

## Grenzen und Datenschutz

Bildbasierte PDFs verlieren Textsuche, Links, Formulare, Vektoren und digitale Signaturen. Das wird vor der Verarbeitung angezeigt. Eine exakt vorgegebene Zielgröße kann nicht garantiert werden. Wenn das Ergebnis bei gleichem Format größer wird, wird stattdessen das Original zum Download angeboten.

Dateien über 100 MB und PDFs über 200 Seiten werden abgelehnt, um den Speicherverbrauch zu begrenzen. Die Erweiterung nutzt lokal gebündelte PDF.js (Apache-2.0) und pdf-lib (MIT); die Lizenzdateien liegen unter `vendor/`. PDF.js enthält lokale WebAssembly-Decoder. Zur Laufzeit wird keine Bibliothek von einem Server geladen.
