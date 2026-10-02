# Lokal Konverter

Browser-Erweiterung für lokale Datei-Konvertierung und -Optimierung in einem kleinen, eigenständigen Browserfenster. Die Verarbeitung läuft ausschließlich auf dem Gerät. Es gibt keine Uploads, Accounts oder Telemetrie.

Die Oberfläche erkennt die Browsersprache automatisch. Englisch ist die Standardsprache; Deutsch, Spanisch und Französisch sind ebenfalls enthalten. Für andere Sprachen wird Englisch verwendet. Über den kleinen Sprachknopf oben rechts kann man jederzeit „Automatisch“ oder eine Sprache manuell wählen; die Auswahl bleibt lokal gespeichert.

Das Farbschema folgt zunächst automatisch dem hellen oder dunklen Browser-/Systemdesign. Über das Mondsymbol oben rechts lassen sich „Automatisch“, „Hell“ oder „Dunkel“ wählen. Eine manuelle Auswahl wird nur lokal im Browser gespeichert.

## Funktionen

- JPG, PNG und WebP per Dateiauswahl oder Drag-and-drop komprimieren und ineinander konvertieren
- Bilder als einseitiges PDF ausgeben; Transparenz wird dabei weiß hinterlegt
- PDF im Modus „Qualität erhalten“ unverändert behalten oder als bildbasierte PDF neu erzeugen; auswählbaren PDF-Text als TXT exportieren
- Für bildbasierte PDFs optional eine Zielgröße in MB angeben; bis zu drei Qualitätsstufen werden lokal getestet
- MP3 oder WAV als unkomprimiertes WAV ausgeben; bei WAV die Abtastrate und optional die Kanalzahl reduzieren
- DOCX als Klartext (TXT) und das erste XLSX-Arbeitsblatt als CSV exportieren
- Bis zu 20 Dateien gemeinsam auswählen oder hinzufügen und nacheinander lokal verarbeiten; Ausgabeformat und Download pro Datei
- Tatsächliche Größe und Vorher/Nachher-Vorschau der ersten PDF-Seite anzeigen
- Ergebnis lokal herunterladen

Die Formatliste hängt von der Eingabedatei ab: Es erscheinen nur tatsächlich implementierte Ausgabewege. Bei einer einzelnen Datei wird die Komprimierungsstärke nur für Bild, PDF und Audio angezeigt; in der Stapelansicht gilt ein gemeinsamer Regler, der reine Textexporte nicht verändert. Vorschau und optionale PDF-Zielgröße sind derzeit nur im Ein-Datei-Modus verfügbar. Stapelergebnisse werden einzeln heruntergeladen.

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

`node tests/fixtures.mjs tests/generated` erzeugt lokale Testdateien. Anschließend `test-browser.command` starten und unter `http://127.0.0.1:8765/tests/regression.html` auf „Run local fixtures“ klicken. Der Browser-Test umfasst Datei-Erkennung, Bild- und PDF-Pfade, Abbruch, Bild→PDF, PDF→TXT, DOCX→TXT, XLSX→CSV und WAV-Ausgabe. `tests/generated/` ist ignoriert und nicht Teil der Erweiterung.

## Grenzen und Datenschutz

Bildbasierte PDFs verlieren Textsuche, Links, Formulare, Vektoren und digitale Signaturen. Das wird vor der Verarbeitung angezeigt. Eine exakt vorgegebene Zielgröße kann nicht garantiert werden. Wenn das Ergebnis bei gleichem Format größer wird, wird stattdessen das Original zum Download angeboten.

DOCX→TXT erhält keine Bilder, Tabellenstruktur, Formatierung oder Seitenaufteilung. XLSX→CSV übernimmt nur Zellwerte des niedrigst nummerierten Arbeitsblatts, keine Formeln, weiteren Blätter oder Formatierung. PDF→TXT funktioniert nur mit auswählbarem Text, nicht mit Scans. WAV ist unkomprimiert: MP3→WAV wird normalerweise größer. Für Audio sind die vom jeweiligen Browser dekodierbaren Eingaben maßgeblich. MP4-Video, MP3-Ausgabe und layoutgetreue Office-Konvertierung sind noch nicht implementiert und werden daher nicht angeboten.

Dateien über 100 MB, PDFs über 200 Seiten und Office-Einträge über 25 MB unkomprimiert werden abgelehnt, um den Speicherverbrauch zu begrenzen. Die Erweiterung nutzt lokal gebündelte PDF.js (Apache-2.0) und pdf-lib (MIT); die Lizenzdateien liegen unter `vendor/`. PDF.js enthält lokale WebAssembly-Decoder. Zur Laufzeit wird keine Bibliothek von einem Server geladen.
