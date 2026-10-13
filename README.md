# localVert

Dateien direkt im Browser konvertieren und verkleinern: Bilder, PDFs, Office-Dateien sowie Audio und Video (abhängig von den Browser-Codecs). Die Verarbeitung erfolgt lokal und funktioniert offline; es gibt keinen Datei-Upload durch die Erweiterung.

## Testversion installieren

Lade unter **[Releases](https://github.com/reathloo/localVert/releases)** die Datei `localvert-0.2.0.zip` herunter und entpacke sie.

- **Chrome:** `chrome://extensions` öffnen, „Entwicklermodus“ aktivieren, „Entpackte Erweiterung laden“ wählen und den entpackten Ordner mit `manifest.json` auswählen.
- **Edge:** Dasselbe unter `edge://extensions` tun.
- **Firefox:** `about:debugging` öffnen → „Dieser Firefox“ → „Temporäres Add-on laden“ → `manifest.json` im entpackten Ordner auswählen. Nach einem Firefox-Neustart muss es erneut geladen werden. Eine dauerhafte Installation benötigt eine von Mozilla signierte XPI-Datei; diese Testversion enthält noch keine.

Danach auf das localVert-Symbol in der Browserleiste klicken. Updates von GitHub werden **nicht automatisch** installiert: Lade eine neue Version herunter und ersetze die bisherige Testinstallation.

**Datenschutz:** Dateien bleiben bei der Verarbeitung auf deinem Gerät. Nur wenn du ausdrücklich „In Upload-Feld einsetzen“ wählst, kann die geöffnete Webseite die Datei anschließend selbst hochladen. Details: [PRIVACY.md](PRIVACY.md).

Dies ist ein Testrelease, keine Store-Version. Einige Formate und Codecs sind browserabhängig; bildbasierte PDFs und vereinfachte Office-Exporte können Textsuche oder Layout verlieren. Entwicklung, Tests und spätere Store-Schritte: [RELEASE.md](RELEASE.md).
