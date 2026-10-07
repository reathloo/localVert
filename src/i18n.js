export const messages = {
  en: {
    officePdfNotice: 'Local PDF with reflowed text as image pages. Layout, images, formulas and slide graphics may be lost; text is not searchable.',
    mediaNotice: 'Local conversion; available codecs depend on this browser.',
    mediaQualityNotice: 'Stronger compression lowers bitrate and may reduce video resolution.',
    mediaWarning: 'Strong settings can noticeably reduce sound and picture quality.',
    mediaCodecUnavailable: 'This browser cannot encode this format locally.',
    mediaReadError: 'This browser cannot read or convert this media file.',
    mediaProgress: 'Converting locally · {percent} %',
    firstFrameNotice: 'Only the first GIF frame or TIFF page is converted.',
    heicNotice: 'HEIC requires native support in this browser; no file is uploaded.',
    heicUnavailable: 'This browser cannot decode HEIC locally.',
    imageReadError: 'This image could not be decoded locally.',
    zipTooLarge: 'The image archive would exceed 200 MB. Use fewer pages or JPEG.',
    mergePdf: 'Combine images into one PDF', mergedPdfName: 'combined-images.pdf', pdfImageNotice: 'Each PDF page becomes an image in a ZIP; text and links are not retained.',
    addFiles: 'Add more files', batchTitle: 'Files', batchCount: '{count} files', batchProcess: 'Process all locally', batchProgress: '{current}/{total} · {name}', batchReady: 'Ready', batchWorking: 'Processing…', batchDone: 'Ready to download', batchFailed: 'Could not process', batchDownload: 'Download', batchDownloadStarted: 'Started ✓', batchLimit: 'Up to 20 files at a time.', batchPdfNotice: 'PDF optimization may create image-only pages.',
    estimateTitle: 'Estimated size', estimateKeepOriginal: 'If larger, the original is kept.', estimateFirstPage: 'Rough estimate from page 1.', estimateResolution: 'Resolution: {width} × {height} px',
    convertedSuffix: '-converted',
    convertedResult: '{original} → {result}.{target}',
    officeReadError: 'This Office file is damaged, protected or too complex to read locally.',
    docxNotice: 'TXT only · formatting, tables and images are lost.',
    xlsxNotice: 'First sheet as CSV · no formatting or formulas.',
    officeResultWarning: ' Content only; layout is not preserved.',
    pdfTextNotice: 'Selectable text only · no layout or images. Scans need OCR.',
    pdfTextResult: ' Only selectable text; no layout or images.',
    pdfNoText: 'This PDF has no selectable text. Scanned pages need OCR, which is not available yet.',
    audioQualityNotice: 'WAV is uncompressed. Stronger settings lower the sample rate; MP3 → WAV often grows.',
    audioWarning: 'A low sample rate and mono audio may noticeably reduce sound quality.',
    audioTooLong: 'The decoded audio is too long for the current memory limit.',
    audioDecodeError: 'This browser cannot decode the audio file.',
    replaceFile: 'Choose another file', cancel: 'Cancel', targetHelp: 'Reaching the target may lower quality.', targetAdjusted: ' Lower quality was used for the target.', previewFailed: 'Preview unavailable. You can still download the result.',
    appName: 'Local Converter', eyebrow: 'PRIVATE · OFFLINE', intro: 'Convert and optimize files locally.', languageButton: 'Language: {language}', autoLanguage: 'Automatic', languageSaveError: 'Could not save the language choice in this browser.', themeButton: 'Color theme: {theme}', autoTheme: 'Automatic', lightTheme: 'Light', darkTheme: 'Dark', themeSaveError: 'Could not save the theme choice in this browser.',
    chooseFile: 'Choose a file', dropFile: 'Drop a file here', orChoose: 'or click to choose', supportedFormats: 'Images, PDF, audio, video and Office', removeFile: 'Remove file',
    compressionStrength: 'Compression strength', gentle: 'Gentle', balanced: 'Balanced', strong: 'Strong', gentleHint: 'Gentle · high quality', strongHint: 'Strong · lower quality',
    qualityHigh: 'Quality: high', qualityUnchanged: 'Quality: unchanged', qualityReduced: 'Quality: reduced', qualityMuchLower: 'Quality: much lower', detailsReduced: 'Details: may be reduced', detailsMuchLower: 'Details: may be greatly reduced', resolutionUnchanged: 'Resolution: unchanged',
    outputFormat: 'Output format', pngLossless: 'PNG (lossless)', targetSize: 'Target size (MB, optional)', targetPlaceholder: 'e.g. 2.5',
    process: 'Process locally', processing: 'Processing…', download: 'Download result', downloadStarted: 'Download started ✓', downloadAgain: 'Download again', downloadStatus: 'Download started. Check your Downloads folder.',
    original: 'Original', result: 'Result', originalPreview: 'Original file preview', resultPreview: 'Result preview', footer: 'Your files stay on your device.', opening: 'Opening converter…', openingFailed: 'Could not open the window. Please reload the extension.',
    pdfWarning: 'Strong compression may blur pages.',
    pngWarning: 'Strong compression reduces resolution and fine details.',
    imageWarning: 'Strong compression may blur details and text.',
    pdfOriginalNotice: 'Original PDF remains unchanged.',
    pdfRasterNotice: 'Image PDF · text search, links, forms, vectors and signatures are lost.',
    calculating: 'Calculating size…',
    largePdfEstimate: 'Size shown after processing (over 30 MB).', largeImageEstimate: 'Size shown after processing (over 30 MB).',
    noEstimate: 'Size shown after processing.',
    unsupported: 'This format is not supported yet.', emptyFile: 'The file is empty. Please choose another file.', fileTooLarge: 'Files over 100 MB cannot currently be processed.', imageKind: 'IMAGE',
    imageEncodeError: 'The browser could not encode the image.', pdfPassword: 'Password-protected PDFs cannot be processed.', pdfReadError: 'The PDF is damaged or cannot be read in this browser.',
    pdfJpegError: 'This browser could not encode the PDF page as JPEG.', cancelled: 'Processing cancelled.', canvasMemory: 'Not enough graphics memory is available for this PDF page.',
    pageProgress: 'Processing page {page} of {total}…', tooManyPages: 'PDFs over 200 pages cannot currently be processed.', variantProgress: 'Calculating version {index} of {total}…',
    invalidTarget: 'Enter a valid target size in MB.', processingLocal: 'Processing the file locally…',
    targetMissed: ' Target not reached.', savedResult: '{original} → {result} · −{percent}%.{target}', convertedLarger: 'Converted: {result}. The selected format is larger than the original.{target}',
    noSmallerResult: 'No saving · original kept.{onePixel}{target}', onePixelResult: ' Image is only 1 × 1 px.',
    pdfResultWarning: ' Image PDF: no text search or forms.',
    actualSaving: 'Actual saving: {percent}%. Result: {result}.', actualNoSaving: 'Actual saving: none. Result: {result}.', processingError: 'The file could not be processed.',
    fileSuffix: '-compressed',
  },
  de: {
    officePdfNotice: 'Lokales PDF mit neu gesetztem Text als Bildseiten. Layout, Bilder, Formeln und Foliengrafiken können entfallen; Text ist nicht durchsuchbar.',
    mediaNotice: 'Lokale Umwandlung; verfügbare Codecs hängen vom Browser ab.',
    mediaQualityNotice: 'Stärkere Komprimierung senkt die Bitrate und ggf. die Videoauflösung.',
    mediaWarning: 'Starke Einstellungen können Klang und Bild deutlich verschlechtern.',
    mediaCodecUnavailable: 'Dieser Browser kann dieses Format lokal nicht kodieren.',
    mediaReadError: 'Dieser Browser kann diese Mediendatei nicht lokal lesen oder umwandeln.',
    mediaProgress: 'Lokale Umwandlung · {percent} %',
    firstFrameNotice: 'Nur das erste GIF-Bild bzw. die erste TIFF-Seite wird konvertiert.',
    heicNotice: 'HEIC braucht native Browser-Unterstützung; es erfolgt kein Upload.',
    heicUnavailable: 'Dieser Browser kann HEIC lokal nicht dekodieren.',
    imageReadError: 'Dieses Bild konnte lokal nicht dekodiert werden.',
    zipTooLarge: 'Das Bildarchiv würde 200 MB überschreiten. Weniger Seiten oder JPEG wählen.',
    mergePdf: 'Bilder zu einem PDF verbinden', mergedPdfName: 'bilder-zusammengefasst.pdf', pdfImageNotice: 'Jede PDF-Seite wird als Bild im ZIP exportiert; Text und Links entfallen.',
    addFiles: 'Weitere Dateien hinzufügen', batchTitle: 'Dateien', batchCount: '{count} Dateien', batchProcess: 'Alle lokal verarbeiten', batchProgress: '{current}/{total} · {name}', batchReady: 'Bereit', batchWorking: 'Wird verarbeitet …', batchDone: 'Download bereit', batchFailed: 'Nicht verarbeitet', batchDownload: 'Herunterladen', batchDownloadStarted: 'Gestartet ✓', batchLimit: 'Bis zu 20 Dateien gleichzeitig.', batchPdfNotice: 'PDF-Optimierung kann reine Bildseiten erzeugen.',
    estimateTitle: 'Voraussichtlich', estimateKeepOriginal: 'Falls größer: Original bleibt.', estimateFirstPage: 'Grobe Schätzung aus Seite 1.', estimateResolution: 'Auflösung: {width} × {height} px',
    convertedSuffix: '-konvertiert',
    convertedResult: '{original} → {result}.{target}',
    officeReadError: 'Diese Office-Datei ist beschädigt, geschützt oder lokal nicht lesbar.',
    docxNotice: 'Nur TXT · Formatierung, Tabellen und Bilder entfallen.',
    xlsxNotice: 'Erstes Blatt als CSV · ohne Formatierung und Formeln.',
    officeResultWarning: ' Nur Inhalt; Layout entfällt.',
    pdfTextNotice: 'Nur auswählbarer Text · kein Layout oder Bilder. Scans brauchen OCR.',
    pdfTextResult: ' Nur auswählbarer Text; kein Layout oder Bilder.',
    pdfNoText: 'Dieses PDF enthält keinen auswählbaren Text. Für Scans wäre OCR nötig; das ist noch nicht verfügbar.',
    audioQualityNotice: 'WAV ist unkomprimiert. Stärker senkt die Abtastrate; MP3 → WAV wird oft größer.',
    audioWarning: 'Eine niedrige Abtastrate und Mono können den Klang deutlich verschlechtern.',
    audioTooLong: 'Die Audiodatei ist für die aktuelle Speichergrenze zu lang.',
    audioDecodeError: 'Dieser Browser kann die Audiodatei nicht dekodieren.',
    replaceFile: 'Andere Datei auswählen', cancel: 'Abbrechen', targetHelp: 'Die Zielgröße kann Qualität kosten.', targetAdjusted: ' Für die Zielgröße wurde Qualität reduziert.', previewFailed: 'Vorschau nicht verfügbar. Download ist trotzdem möglich.',
    appName: 'Lokal Konverter', eyebrow: 'PRIVAT · OFFLINE', intro: 'Dateien lokal konvertieren und optimieren.', languageButton: 'Sprache: {language}', autoLanguage: 'Automatisch', languageSaveError: 'Die Sprachauswahl konnte in diesem Browser nicht gespeichert werden.', themeButton: 'Farbschema: {theme}', autoTheme: 'Automatisch', lightTheme: 'Hell', darkTheme: 'Dunkel', themeSaveError: 'Das Farbschema konnte in diesem Browser nicht gespeichert werden.',
    chooseFile: 'Datei auswählen', dropFile: 'Datei hier ablegen', orChoose: 'oder klicken zum Auswählen', supportedFormats: 'Bilder, PDF, Audio, Video und Office', removeFile: 'Datei entfernen',
    compressionStrength: 'Komprimierungsstärke', gentle: 'Schonend', balanced: 'Ausgewogen', strong: 'Stark', gentleHint: 'Schonend · hohe Qualität', strongHint: 'Stark · weniger Qualität',
    qualityHigh: 'Qualität: hoch', qualityUnchanged: 'Qualität: unverändert', qualityReduced: 'Qualität: reduziert', qualityMuchLower: 'Qualität: deutlich geringer', detailsReduced: 'Details: ggf. reduziert', detailsMuchLower: 'Details: ggf. deutlich reduziert', resolutionUnchanged: 'Auflösung: unverändert',
    outputFormat: 'Ausgabeformat', pngLossless: 'PNG (verlustfrei)', targetSize: 'Zielgröße (MB, optional)', targetPlaceholder: 'z. B. 2,5',
    process: 'Lokal verarbeiten', processing: 'Verarbeitung läuft …', download: 'Ergebnis herunterladen', downloadStarted: 'Download gestartet ✓', downloadAgain: 'Erneut herunterladen', downloadStatus: 'Download gestartet. Prüfe deinen Downloads-Ordner.',
    original: 'Original', result: 'Ergebnis', originalPreview: 'Vorschau der Originaldatei', resultPreview: 'Vorschau des Ergebnisses', footer: 'Deine Dateien bleiben auf deinem Gerät.', opening: 'Konverter wird geöffnet …', openingFailed: 'Fenster konnte nicht geöffnet werden. Bitte Erweiterung neu laden.',
    pdfWarning: 'Starke Komprimierung kann Seiten unscharf machen.',
    pngWarning: 'Starke Komprimierung senkt Auflösung und Details.',
    imageWarning: 'Starke Komprimierung kann Details und Text verwischen.',
    pdfOriginalNotice: 'Original-PDF bleibt unverändert.',
    pdfRasterNotice: 'Bild-PDF · Textsuche, Links, Formulare, Vektoren und Signaturen entfallen.',
    calculating: 'Berechne Größe…',
    largePdfEstimate: 'Größe nach Verarbeitung sichtbar (über 30 MB).', largeImageEstimate: 'Größe nach Verarbeitung sichtbar (über 30 MB).',
    noEstimate: 'Größe nach Verarbeitung sichtbar.',
    unsupported: 'Dieses Format wird im MVP noch nicht unterstützt.', emptyFile: 'Die Datei ist leer. Bitte eine andere Datei wählen.', fileTooLarge: 'Dateien über 100 MB werden derzeit nicht verarbeitet.', imageKind: 'BILD',
    imageEncodeError: 'Der Browser konnte das Bild nicht kodieren.', pdfPassword: 'Passwortgeschützte PDFs werden nicht verarbeitet.', pdfReadError: 'Die PDF ist beschädigt oder kann in diesem Browser nicht gelesen werden.',
    pdfJpegError: 'Dieser Browser konnte die PDF-Seite nicht als JPEG kodieren.', cancelled: 'Verarbeitung abgebrochen.', canvasMemory: 'Für diese PDF-Seite ist nicht genug Grafikspeicher verfügbar.',
    pageProgress: 'Seite {page} von {total} wird verarbeitet …', tooManyPages: 'PDFs mit mehr als 200 Seiten werden derzeit nicht verarbeitet.', variantProgress: 'Variante {index} von {total} wird berechnet …',
    invalidTarget: 'Bitte eine gültige Zielgröße in MB eingeben.', processingLocal: 'Datei wird lokal verarbeitet …',
    targetMissed: ' Zielgröße verfehlt.', savedResult: '{original} → {result} · −{percent} %.{target}', convertedLarger: 'Konvertiert: {result}. Das gewählte Format ist größer als das Original.{target}',
    noSmallerResult: 'Keine Einsparung · Original bleibt.{onePixel}{target}', onePixelResult: ' Bild hat nur 1 × 1 px.',
    pdfResultWarning: ' Bild-PDF: keine Textsuche oder Formulare.',
    actualSaving: 'Tatsächliche Einsparung: {percent} %. Ergebnis: {result}.', actualNoSaving: 'Tatsächliche Einsparung: keine. Ergebnis: {result}.', processingError: 'Die Datei konnte nicht verarbeitet werden.',
    fileSuffix: '-komprimiert',
  },
  es: {
    officePdfNotice: 'PDF local con texto como páginas de imagen. Pueden perderse diseño, imágenes, fórmulas y gráficos; el texto no se puede buscar.',
    mediaNotice: 'Conversión local; los códecs dependen del navegador.',
    mediaQualityNotice: 'Más compresión reduce la tasa de bits y quizá la resolución.',
    mediaWarning: 'Los ajustes fuertes pueden reducir notablemente sonido e imagen.',
    mediaCodecUnavailable: 'Este navegador no puede codificar este formato localmente.',
    mediaReadError: 'Este navegador no puede leer o convertir este archivo multimedia.',
    mediaProgress: 'Conversión local · {percent} %',
    firstFrameNotice: 'Solo se convierte el primer fotograma GIF o página TIFF.',
    heicNotice: 'HEIC requiere compatibilidad nativa del navegador; no se sube el archivo.',
    heicUnavailable: 'Este navegador no puede decodificar HEIC localmente.',
    imageReadError: 'No se pudo decodificar esta imagen localmente.',
    zipTooLarge: 'El archivo de imágenes superaría 200 MB. Usa menos páginas o JPEG.',
    mergePdf: 'Unir imágenes en un PDF', mergedPdfName: 'imagenes-combinadas.pdf', pdfImageNotice: 'Cada página PDF se exporta como imagen en un ZIP; se pierden texto y enlaces.',
    addFiles: 'Añadir más archivos', batchTitle: 'Archivos', batchCount: '{count} archivos', batchProcess: 'Procesar todos localmente', batchProgress: '{current}/{total} · {name}', batchReady: 'Listo', batchWorking: 'Procesando…', batchDone: 'Listo para descargar', batchFailed: 'No procesado', batchDownload: 'Descargar', batchDownloadStarted: 'Iniciada ✓', batchLimit: 'Hasta 20 archivos a la vez.', batchPdfNotice: 'La optimización de PDF puede crear páginas solo de imagen.',
    estimateTitle: 'Tamaño estimado', estimateKeepOriginal: 'Si es mayor, se conserva el original.', estimateFirstPage: 'Estimación aproximada de la página 1.', estimateResolution: 'Resolución: {width} × {height} px',
    convertedSuffix: '-convertido',
    convertedResult: '{original} → {result}.{target}',
    officeReadError: 'Este archivo de Office está dañado, protegido o es demasiado complejo para leerlo localmente.',
    docxNotice: 'Solo TXT · se pierden formato, tablas e imágenes.',
    xlsxNotice: 'Primera hoja como CSV · sin formato ni fórmulas.',
    officeResultWarning: ' Solo contenido; no se conserva el diseño.',
    pdfTextNotice: 'Solo texto seleccionable · sin diseño ni imágenes. Los escaneos necesitan OCR.',
    pdfTextResult: ' Solo texto seleccionable; sin diseño ni imágenes.',
    pdfNoText: 'Este PDF no contiene texto seleccionable. Los escaneos necesitan OCR, que aún no está disponible.',
    audioQualityNotice: 'WAV no está comprimido. Un ajuste fuerte reduce la frecuencia; MP3 → WAV suele crecer.',
    audioWarning: 'Una frecuencia de muestreo baja y el sonido mono pueden reducir notablemente la calidad.',
    audioTooLong: 'El audio decodificado supera el límite de memoria actual.',
    audioDecodeError: 'Este navegador no puede decodificar el archivo de audio.',
    replaceFile: 'Seleccionar otro archivo', cancel: 'Cancelar', targetHelp: 'Alcanzar el objetivo puede reducir la calidad.', targetAdjusted: ' Se redujo la calidad para el tamaño objetivo.', previewFailed: 'Vista previa no disponible. Puedes descargar el resultado.',
    appName: 'Conversor local', eyebrow: 'PRIVADO · SIN CONEXIÓN', intro: 'Convierte y optimiza archivos localmente.', languageButton: 'Idioma: {language}', autoLanguage: 'Automático', languageSaveError: 'No se pudo guardar el idioma elegido en este navegador.', themeButton: 'Tema de color: {theme}', autoTheme: 'Automático', lightTheme: 'Claro', darkTheme: 'Oscuro', themeSaveError: 'No se pudo guardar el tema en este navegador.',
    chooseFile: 'Seleccionar archivo', dropFile: 'Suelta un archivo aquí', orChoose: 'o haz clic para seleccionar', supportedFormats: 'Imágenes, PDF, audio, vídeo y Office', removeFile: 'Quitar archivo',
    compressionStrength: 'Intensidad de compresión', gentle: 'Suave', balanced: 'Equilibrada', strong: 'Alta', gentleHint: 'Suave · alta calidad', strongHint: 'Alta · menor calidad',
    qualityHigh: 'Calidad: alta', qualityUnchanged: 'Calidad: sin cambios', qualityReduced: 'Calidad: reducida', qualityMuchLower: 'Calidad: mucho menor', detailsReduced: 'Detalles: pueden reducirse', detailsMuchLower: 'Detalles: pueden reducirse mucho', resolutionUnchanged: 'Resolución: sin cambios',
    outputFormat: 'Formato de salida', pngLossless: 'PNG (sin pérdida)', targetSize: 'Tamaño objetivo (MB, opcional)', targetPlaceholder: 'p. ej., 2,5',
    process: 'Procesar localmente', processing: 'Procesando…', download: 'Descargar resultado', downloadStarted: 'Descarga iniciada ✓', downloadAgain: 'Descargar de nuevo', downloadStatus: 'Descarga iniciada. Revisa tu carpeta de descargas.',
    original: 'Original', result: 'Resultado', originalPreview: 'Vista previa del archivo original', resultPreview: 'Vista previa del resultado', footer: 'Tus archivos permanecen en tu dispositivo.', opening: 'Abriendo conversor…', openingFailed: 'No se pudo abrir la ventana. Vuelve a cargar la extensión.',
    pdfWarning: 'La compresión fuerte puede desenfocar las páginas.',
    pngWarning: 'La compresión fuerte reduce resolución y detalles.',
    imageWarning: 'La compresión fuerte puede desenfocar detalles y texto.',
    pdfOriginalNotice: 'El PDF original no cambia.',
    pdfRasterNotice: 'PDF de imagen · se pierden búsqueda, enlaces, formularios, vectores y firmas.',
    calculating: 'Calculando tamaño…',
    largePdfEstimate: 'Tamaño visible tras procesar (más de 30 MB).', largeImageEstimate: 'Tamaño visible tras procesar (más de 30 MB).',
    noEstimate: 'Tamaño visible tras procesar.',
    unsupported: 'Este formato todavía no es compatible.', emptyFile: 'El archivo está vacío. Selecciona otro.', fileTooLarge: 'Actualmente no se pueden procesar archivos de más de 100 MB.', imageKind: 'IMAGEN',
    imageEncodeError: 'El navegador no pudo codificar la imagen.', pdfPassword: 'No se pueden procesar PDF protegidos con contraseña.', pdfReadError: 'El PDF está dañado o no se puede leer en este navegador.',
    pdfJpegError: 'Este navegador no pudo codificar la página del PDF como JPEG.', cancelled: 'Procesamiento cancelado.', canvasMemory: 'No hay suficiente memoria gráfica para esta página del PDF.',
    pageProgress: 'Procesando página {page} de {total}…', tooManyPages: 'Actualmente no se pueden procesar PDF de más de 200 páginas.', variantProgress: 'Calculando versión {index} de {total}…',
    invalidTarget: 'Introduce un tamaño objetivo válido en MB.', processingLocal: 'Procesando el archivo localmente…',
    targetMissed: ' No se alcanzó el tamaño objetivo.', savedResult: '{original} → {result} · −{percent} %.{target}', convertedLarger: 'Convertido: {result}. El formato elegido es más grande que el original.{target}',
    noSmallerResult: 'Sin ahorro · se conserva el original.{onePixel}{target}', onePixelResult: ' Imagen de solo 1 × 1 px.',
    pdfResultWarning: ' PDF de imagen: sin búsqueda ni formularios.',
    actualSaving: 'Ahorro real: {percent} %. Resultado: {result}.', actualNoSaving: 'Ahorro real: ninguno. Resultado: {result}.', processingError: 'No se pudo procesar el archivo.',
    fileSuffix: '-comprimido',
  },
  fr: {
    officePdfNotice: 'PDF local avec texte en pages image. Mise en page, images, formules et graphiques peuvent être perdus ; texte non consultable.',
    mediaNotice: 'Conversion locale ; les codecs dépendent du navigateur.',
    mediaQualityNotice: 'Plus de compression réduit le débit et parfois la résolution.',
    mediaWarning: 'Des réglages forts peuvent dégrader nettement son et image.',
    mediaCodecUnavailable: 'Ce navigateur ne peut pas encoder ce format localement.',
    mediaReadError: 'Ce navigateur ne peut pas lire ou convertir ce média localement.',
    mediaProgress: 'Conversion locale · {percent} %',
    firstFrameNotice: 'Seule la première image GIF ou page TIFF est convertie.',
    heicNotice: 'HEIC exige une prise en charge native du navigateur ; aucun envoi.',
    heicUnavailable: 'Ce navigateur ne peut pas décoder HEIC localement.',
    imageReadError: 'Cette image ne peut pas être décodée localement.',
    zipTooLarge: 'L’archive d’images dépasserait 200 Mo. Réduisez les pages ou choisissez JPEG.',
    mergePdf: 'Réunir les images en un PDF', mergedPdfName: 'images-assemblees.pdf', pdfImageNotice: 'Chaque page PDF devient une image dans un ZIP ; texte et liens sont perdus.',
    addFiles: 'Ajouter des fichiers', batchTitle: 'Fichiers', batchCount: '{count} fichiers', batchProcess: 'Tout traiter localement', batchProgress: '{current}/{total} · {name}', batchReady: 'Prêt', batchWorking: 'Traitement…', batchDone: 'Prêt à télécharger', batchFailed: 'Non traité', batchDownload: 'Télécharger', batchDownloadStarted: 'Lancé ✓', batchLimit: 'Jusqu’à 20 fichiers à la fois.', batchPdfNotice: 'L’optimisation PDF peut créer des pages image.',
    estimateTitle: 'Taille estimée', estimateKeepOriginal: 'Si plus grand, l’original est conservé.', estimateFirstPage: 'Estimation approximative depuis la page 1.', estimateResolution: 'Résolution : {width} × {height} px',
    convertedSuffix: '-converti',
    convertedResult: '{original} → {result}.{target}',
    officeReadError: 'Ce fichier Office est endommagé, protégé ou trop complexe pour une lecture locale.',
    docxNotice: 'TXT seul · mise en forme, tableaux et images perdus.',
    xlsxNotice: 'Première feuille en CSV · sans mise en forme ni formules.',
    officeResultWarning: ' Contenu seul ; mise en page perdue.',
    pdfTextNotice: 'Texte sélectionnable seul · sans mise en page ni images. Les scans nécessitent un OCR.',
    pdfTextResult: ' Texte sélectionnable seul ; sans mise en page ni images.',
    pdfNoText: 'Ce PDF ne contient pas de texte sélectionnable. Les scans nécessitent un OCR, pas encore disponible.',
    audioQualityNotice: 'WAV est non compressé. Un réglage fort réduit la fréquence ; MP3 → WAV grossit souvent.',
    audioWarning: 'Une faible fréquence d’échantillonnage et le mono peuvent nettement dégrader le son.',
    audioTooLong: 'Le fichier audio décodé dépasse la limite de mémoire actuelle.',
    audioDecodeError: 'Ce navigateur ne peut pas décoder ce fichier audio.',
    replaceFile: 'Choisir un autre fichier', cancel: 'Annuler', targetHelp: 'Atteindre la cible peut réduire la qualité.', targetAdjusted: ' Qualité réduite pour atteindre la cible.', previewFailed: 'Aperçu indisponible. Téléchargement possible.',
    appName: 'Convertisseur local', eyebrow: 'PRIVÉ · HORS LIGNE', intro: 'Convertissez et optimisez vos fichiers localement.', languageButton: 'Langue : {language}', autoLanguage: 'Automatique', languageSaveError: 'Impossible d’enregistrer la langue choisie dans ce navigateur.', themeButton: 'Thème de couleurs : {theme}', autoTheme: 'Automatique', lightTheme: 'Clair', darkTheme: 'Sombre', themeSaveError: 'Impossible d’enregistrer le thème dans ce navigateur.',
    chooseFile: 'Choisir un fichier', dropFile: 'Déposez un fichier ici', orChoose: 'ou cliquez pour choisir', supportedFormats: 'Images, PDF, audio, vidéo et Office', removeFile: 'Supprimer le fichier',
    compressionStrength: 'Intensité de compression', gentle: 'Douce', balanced: 'Équilibrée', strong: 'Forte', gentleHint: 'Douce · qualité élevée', strongHint: 'Forte · qualité réduite',
    qualityHigh: 'Qualité : élevée', qualityUnchanged: 'Qualité : inchangée', qualityReduced: 'Qualité : réduite', qualityMuchLower: 'Qualité : nettement réduite', detailsReduced: 'Détails : réduction possible', detailsMuchLower: 'Détails : forte réduction possible', resolutionUnchanged: 'Résolution : inchangée',
    outputFormat: 'Format de sortie', pngLossless: 'PNG (sans perte)', targetSize: 'Taille cible (Mo, facultatif)', targetPlaceholder: 'p. ex. 2,5',
    process: 'Traiter localement', processing: 'Traitement en cours…', download: 'Télécharger le résultat', downloadStarted: 'Téléchargement lancé ✓', downloadAgain: 'Télécharger à nouveau', downloadStatus: 'Téléchargement lancé. Vérifiez votre dossier Téléchargements.',
    original: 'Original', result: 'Résultat', originalPreview: 'Aperçu du fichier original', resultPreview: 'Aperçu du résultat', footer: 'Vos fichiers restent sur votre appareil.', opening: 'Ouverture du convertisseur…', openingFailed: 'Impossible d’ouvrir la fenêtre. Rechargez l’extension.',
    pdfWarning: 'Une forte compression peut rendre les pages floues.',
    pngWarning: 'Une forte compression réduit résolution et détails.',
    imageWarning: 'Une forte compression peut flouter détails et texte.',
    pdfOriginalNotice: 'PDF original inchangé.',
    pdfRasterNotice: 'PDF image · recherche, liens, formulaires, vecteurs et signatures perdus.',
    calculating: 'Calcul de la taille…',
    largePdfEstimate: 'Taille affichée après traitement (plus de 30 Mo).', largeImageEstimate: 'Taille affichée après traitement (plus de 30 Mo).',
    noEstimate: 'Taille affichée après traitement.',
    unsupported: 'Ce format n’est pas encore pris en charge.', emptyFile: 'Le fichier est vide. Choisissez-en un autre.', fileTooLarge: 'Les fichiers de plus de 100 Mo ne peuvent pas être traités actuellement.', imageKind: 'IMAGE',
    imageEncodeError: 'Le navigateur n’a pas pu encoder l’image.', pdfPassword: 'Les PDF protégés par mot de passe ne peuvent pas être traités.', pdfReadError: 'Le PDF est endommagé ou illisible dans ce navigateur.',
    pdfJpegError: 'Ce navigateur n’a pas pu encoder la page PDF en JPEG.', cancelled: 'Traitement annulé.', canvasMemory: 'La mémoire graphique est insuffisante pour cette page PDF.',
    pageProgress: 'Traitement de la page {page} sur {total}…', tooManyPages: 'Les PDF de plus de 200 pages ne peuvent pas être traités actuellement.', variantProgress: 'Calcul de la version {index} sur {total}…',
    invalidTarget: 'Saisissez une taille cible valide en Mo.', processingLocal: 'Traitement local du fichier…',
    targetMissed: ' Cible non atteinte.', savedResult: '{original} → {result} · −{percent} %.{target}', convertedLarger: 'Converti : {result}. Le format choisi est plus volumineux que l’original.{target}',
    noSmallerResult: 'Aucun gain · original conservé.{onePixel}{target}', onePixelResult: ' Image de 1 × 1 px.',
    pdfResultWarning: ' PDF image : sans recherche ni formulaires.',
    actualSaving: 'Gain réel : {percent} %. Résultat : {result}.', actualNoSaving: 'Gain réel : aucun. Résultat : {result}.', processingError: 'Impossible de traiter le fichier.',
    fileSuffix: '-compresse',
  },
};

export function localeFromLanguages(languages) {
  for (const language of languages) {
    const code = String(language || '').toLowerCase().split(/[-_]/)[0];
    if (Object.hasOwn(messages, code)) return code;
  }
  return 'en';
}

const browserLanguage = (() => {
  try { return (globalThis.browser ?? globalThis.chrome)?.i18n?.getUILanguage?.(); }
  catch { return undefined; }
})();

const detectedLocale = localeFromLanguages([browserLanguage, ...(globalThis.navigator?.languages ?? []), globalThis.navigator?.language]);
const preferenceKey = 'localVert.language';

export function getLanguagePreference() {
  try {
    const value = globalThis.localStorage?.getItem(preferenceKey);
    return Object.hasOwn(messages, value) ? value : 'auto';
  } catch { return 'auto'; }
}

export let locale = getLanguagePreference() === 'auto' ? detectedLocale : getLanguagePreference();

export function setLanguagePreference(value) {
  if (value !== 'auto' && !Object.hasOwn(messages, value)) return false;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;
    if (value === 'auto') storage.removeItem(preferenceKey);
    else storage.setItem(preferenceKey, value);
    locale = value === 'auto' ? detectedLocale : value;
    return true;
  } catch { return false; }
}

export function t(key, values = {}) {
  const template = messages[locale][key] ?? messages.en[key];
  if (template === undefined) throw new Error(`Missing translation: ${key}`);
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

export function applyStaticTranslations(root = document) {
  root.documentElement.lang = locale;
  root.title = t('appName');
  for (const element of root.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n);
  for (const attribute of ['aria-label', 'title', 'placeholder', 'alt']) {
    const dataName = `i18n${attribute.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}`;
    for (const element of root.querySelectorAll(`[data-i18n-${attribute}]`)) element.setAttribute(attribute, t(element.dataset[dataName]));
  }
}
