export const messages = {
  en: {
    appName: 'Local Converter', eyebrow: 'PRIVATE · OFFLINE', intro: 'Process images and PDFs without files leaving your device.', languageButton: 'Language: {language}', autoLanguage: 'Automatic', languageSaveError: 'Could not save the language choice in this browser.',
    chooseFile: 'Choose a file', dropFile: 'Drop a file here', orChoose: 'or click to choose', supportedFormats: 'JPG, PNG, WebP and PDF', removeFile: 'Remove file',
    compressionStrength: 'Compression strength', gentle: 'Gentle', balanced: 'Balanced', strong: 'Strong', gentleHint: 'Gentle · high quality', strongHint: 'Strong · lower quality',
    qualityHigh: 'Quality: high', qualityUnchanged: 'Quality: unchanged', qualityReduced: 'Quality: reduced', qualityMuchLower: 'Quality: much lower', detailsReduced: 'Details: may be reduced', detailsMuchLower: 'Details: may be greatly reduced', resolutionUnchanged: 'Resolution: unchanged',
    outputFormat: 'Output format', pngLossless: 'PNG (lossless)', targetSize: 'Target size (MB, optional)', targetPlaceholder: 'e.g. 2.5',
    process: 'Process locally', processing: 'Processing…', download: 'Download result', downloadStarted: 'Download started ✓', downloadAgain: 'Download again', downloadStatus: 'Download started. Check your Downloads folder.',
    original: 'Original', result: 'Result', originalPreview: 'Original file preview', resultPreview: 'Result preview', footer: 'Processing takes place entirely on your device.', opening: 'Opening converter…', openingFailed: 'Could not open the window. Please reload the extension.',
    pdfWarning: 'Warning: Strong quality loss is possible. Pages may become blurry; searchable text, links and forms will be lost.',
    pngWarning: 'Warning: PNG encoding stays lossless, but image resolution may drop sharply. Fine details can be lost.',
    imageWarning: 'Warning: Strong quality loss is possible. Fine details and text in the image may become visibly blurry.',
    pdfOriginalNotice: 'Original preserved: text, links, forms and vectors remain unchanged. Choose another mode for a smaller PDF.',
    pdfRasterNotice: 'Image-based PDF: searchable text, links, forms, vectors and digital signatures will be lost. The original file remains unchanged.',
    pdfOriginalEstimate: 'Estimated saving: 0%. The PDF remains unchanged.', calculating: 'Estimated saving: calculating locally…',
    largePdfEstimate: 'For PDFs over 30 MB, the percentage appears after processing.', largeImageEstimate: 'For images over 30 MB, the percentage appears after processing.',
    tooManyPagesEstimate: 'PDFs over 200 pages cannot currently be processed.',
    pdfNoSaving: 'No saving at this setting: original {original}, projected {projected}. This PDF is already smaller than the image-based version. {sampleNote}Stronger compression or a target size may help, but searchable text and PDF features will be lost.',
    pdfSaving: 'Estimated saving: {saving} ({original} → {projected}). {sampleNote} The target size is not guaranteed.',
    sampleOtherPages: 'Estimate from page 1; other pages may differ. ', sampleOnePage: 'Locally calculated test result.', sampleManyPages: 'Rough projection from page 1; other pages may differ significantly.',
    noSavingImage: 'No saving at this setting: original {original}, test version {candidate}. {reason}',
    onePixelReason: 'The image is only {dimensions} and cannot be made smaller.',
    pngReason: 'This PNG is already efficient. Try stronger compression or, if allowed, WebP/JPEG.',
    imageReason: 'The original is already efficiently compressed; try a stronger setting.',
    imageEstimate: 'Estimated size change: {saving} ({original} → {candidate}). Locally calculated test result{resolution}.',
    resolutionChange: '; resolution {from} → {to}', noEstimate: 'No reliable preview is available; the actual size will be shown after processing.',
    aboutSmaller: 'about {percent}% smaller', aboutLarger: 'none (result about {percent}% larger)', aboutZero: 'about 0%',
    unsupported: 'This format is not supported yet.', emptyFile: 'The file is empty. Please choose another file.', fileTooLarge: 'Files over 100 MB cannot currently be processed.', imageKind: 'IMAGE',
    imageEncodeError: 'The browser could not encode the image.', pdfPassword: 'Password-protected PDFs cannot be processed.', pdfReadError: 'The PDF is damaged or cannot be read in this browser.',
    pdfJpegError: 'This browser could not encode the PDF page as JPEG.', cancelled: 'Processing cancelled.', canvasMemory: 'Not enough graphics memory is available for this PDF page.',
    pageProgress: 'Processing page {page} of {total}…', tooManyPages: 'PDFs over 200 pages cannot currently be processed.', variantProgress: 'Calculating version {index} of {total}…',
    invalidTarget: 'Enter a valid target size in MB.', processingLocal: 'Processing the file locally…',
    targetMissed: ' The target size was not reached.', savedResult: '{result} instead of {original} · {percent}% smaller.{target}', convertedLarger: 'Converted: {result}. The selected format is larger than the original.{target}',
    noSmallerResult: 'No smaller file possible. The original remains the best version.{onePixel}{target}', onePixelResult: ' This image is only 1 × 1 pixels.',
    pdfResultWarning: ' The new PDF consists of images; searchable text, links and forms are not included.',
    actualSaving: 'Actual saving: {percent}%. Result: {result}.', actualNoSaving: 'Actual saving: none. Result: {result}.', processingError: 'The file could not be processed.',
    fileSuffix: '-compressed',
  },
  de: {
    appName: 'Lokal Konverter', eyebrow: 'PRIVAT · OFFLINE', intro: 'Bilder und PDFs verarbeiten, ohne dass eine Datei dein Gerät verlässt.', languageButton: 'Sprache: {language}', autoLanguage: 'Automatisch', languageSaveError: 'Die Sprachauswahl konnte in diesem Browser nicht gespeichert werden.',
    chooseFile: 'Datei auswählen', dropFile: 'Datei hier ablegen', orChoose: 'oder klicken zum Auswählen', supportedFormats: 'JPG, PNG, WebP und PDF', removeFile: 'Datei entfernen',
    compressionStrength: 'Komprimierungsstärke', gentle: 'Schonend', balanced: 'Ausgewogen', strong: 'Stark', gentleHint: 'Schonend · hohe Qualität', strongHint: 'Stark · weniger Qualität',
    qualityHigh: 'Qualität: hoch', qualityUnchanged: 'Qualität: unverändert', qualityReduced: 'Qualität: reduziert', qualityMuchLower: 'Qualität: deutlich geringer', detailsReduced: 'Details: ggf. reduziert', detailsMuchLower: 'Details: ggf. deutlich reduziert', resolutionUnchanged: 'Auflösung: unverändert',
    outputFormat: 'Ausgabeformat', pngLossless: 'PNG (verlustfrei)', targetSize: 'Zielgröße (MB, optional)', targetPlaceholder: 'z. B. 2,5',
    process: 'Lokal verarbeiten', processing: 'Verarbeitung läuft …', download: 'Ergebnis herunterladen', downloadStarted: 'Download gestartet ✓', downloadAgain: 'Erneut herunterladen', downloadStatus: 'Download gestartet. Prüfe deinen Downloads-Ordner.',
    original: 'Original', result: 'Ergebnis', originalPreview: 'Vorschau der Originaldatei', resultPreview: 'Vorschau des Ergebnisses', footer: 'Verarbeitung findet ausschließlich auf deinem Gerät statt.', opening: 'Konverter wird geöffnet …', openingFailed: 'Fenster konnte nicht geöffnet werden. Bitte Erweiterung neu laden.',
    pdfWarning: 'Achtung: Starke Qualitätsverluste möglich. Seiten können unscharf werden; Textsuche, Links und Formulare gehen verloren.',
    pngWarning: 'Achtung: PNG bleibt verlustfrei kodiert, aber die Bildauflösung kann stark sinken. Feine Details können verloren gehen.',
    imageWarning: 'Achtung: Starke Qualitätsverluste möglich. Feine Details und Schrift im Bild können sichtbar unscharf werden.',
    pdfOriginalNotice: 'Original erhalten: Text, Links, Formulare und Vektoren bleiben unverändert. Für eine kleinere PDF einen anderen Modus wählen.',
    pdfRasterNotice: 'Bildbasierte PDF: Textsuche, Links, Formulare, Vektoren und digitale Signaturen gehen verloren. Die Originaldatei bleibt erhalten.',
    pdfOriginalEstimate: 'Voraussichtliche Einsparung: 0 %. Die PDF bleibt unverändert.', calculating: 'Voraussichtliche Einsparung: wird lokal berechnet …',
    largePdfEstimate: 'Bei PDFs über 30 MB erscheint der Prozentwert nach der Verarbeitung.', largeImageEstimate: 'Bei Bildern über 30 MB erscheint der Prozentwert nach der Verarbeitung.',
    tooManyPagesEstimate: 'Bei PDFs über 200 Seiten ist derzeit keine Verarbeitung möglich.',
    pdfNoSaving: 'Keine Einsparung mit dieser Einstellung: Original {original}, Hochrechnung {projected}. Die PDF ist hier bereits kleiner als die bildbasierte Variante. {sampleNote}Stärkere Komprimierung oder eine Zielgröße kann helfen, aber Textsuche und PDF-Funktionen gehen dabei verloren.',
    pdfSaving: 'Voraussichtliche Einsparung: {saving} ({original} → {projected}). {sampleNote} Die Zielgröße ist nicht garantiert.',
    sampleOtherPages: 'Schätzung aus Seite 1; andere Seiten können abweichen. ', sampleOnePage: 'Lokal berechnetes Probeergebnis.', sampleManyPages: 'Grobe Hochrechnung aus Seite 1; andere Seiten können stark abweichen.',
    noSavingImage: 'Keine Einsparung mit dieser Einstellung: Original {original}, Testvariante {candidate}. {reason}',
    onePixelReason: 'Das Bild hat nur {dimensions} und kann nicht weiter verkleinert werden.',
    pngReason: 'PNG ist hier bereits effizient. Versuche stärkere Komprimierung oder – falls erlaubt – WebP/JPEG.',
    imageReason: 'Das Original ist bereits effizient komprimiert; versuche eine stärkere Einstellung.',
    imageEstimate: 'Voraussichtliche Größenänderung: {saving} ({original} → {candidate}). Lokal berechnetes Probeergebnis{resolution}.',
    resolutionChange: '; Auflösung {from} → {to}', noEstimate: 'Keine zuverlässige Vorschau möglich; die tatsächliche Größe wird nach der Verarbeitung angezeigt.',
    aboutSmaller: 'ca. {percent} % kleiner', aboutLarger: 'keine (Ergebnis ca. {percent} % größer)', aboutZero: 'ca. 0 %',
    unsupported: 'Dieses Format wird im MVP noch nicht unterstützt.', emptyFile: 'Die Datei ist leer. Bitte eine andere Datei wählen.', fileTooLarge: 'Dateien über 100 MB werden derzeit nicht verarbeitet.', imageKind: 'BILD',
    imageEncodeError: 'Der Browser konnte das Bild nicht kodieren.', pdfPassword: 'Passwortgeschützte PDFs werden nicht verarbeitet.', pdfReadError: 'Die PDF ist beschädigt oder kann in diesem Browser nicht gelesen werden.',
    pdfJpegError: 'Dieser Browser konnte die PDF-Seite nicht als JPEG kodieren.', cancelled: 'Verarbeitung abgebrochen.', canvasMemory: 'Für diese PDF-Seite ist nicht genug Grafikspeicher verfügbar.',
    pageProgress: 'Seite {page} von {total} wird verarbeitet …', tooManyPages: 'PDFs mit mehr als 200 Seiten werden derzeit nicht verarbeitet.', variantProgress: 'Variante {index} von {total} wird berechnet …',
    invalidTarget: 'Bitte eine gültige Zielgröße in MB eingeben.', processingLocal: 'Datei wird lokal verarbeitet …',
    targetMissed: ' Die Zielgröße wurde nicht erreicht.', savedResult: '{result} statt {original} · {percent} % kleiner.{target}', convertedLarger: 'Konvertiert: {result}. Das gewählte Format ist größer als das Original.{target}',
    noSmallerResult: 'Keine kleinere Datei möglich. Das Original bleibt die beste Variante.{onePixel}{target}', onePixelResult: ' Dieses Bild hat nur 1 × 1 Pixel.',
    pdfResultWarning: ' Die neue PDF besteht aus Bildern; Textsuche, Links und Formulare sind nicht enthalten.',
    actualSaving: 'Tatsächliche Einsparung: {percent} %. Ergebnis: {result}.', actualNoSaving: 'Tatsächliche Einsparung: keine. Ergebnis: {result}.', processingError: 'Die Datei konnte nicht verarbeitet werden.',
    fileSuffix: '-komprimiert',
  },
  es: {
    appName: 'Conversor local', eyebrow: 'PRIVADO · SIN CONEXIÓN', intro: 'Procesa imágenes y PDF sin que los archivos salgan de tu dispositivo.', languageButton: 'Idioma: {language}', autoLanguage: 'Automático', languageSaveError: 'No se pudo guardar el idioma elegido en este navegador.',
    chooseFile: 'Seleccionar archivo', dropFile: 'Suelta un archivo aquí', orChoose: 'o haz clic para seleccionar', supportedFormats: 'JPG, PNG, WebP y PDF', removeFile: 'Quitar archivo',
    compressionStrength: 'Intensidad de compresión', gentle: 'Suave', balanced: 'Equilibrada', strong: 'Alta', gentleHint: 'Suave · alta calidad', strongHint: 'Alta · menor calidad',
    qualityHigh: 'Calidad: alta', qualityUnchanged: 'Calidad: sin cambios', qualityReduced: 'Calidad: reducida', qualityMuchLower: 'Calidad: mucho menor', detailsReduced: 'Detalles: pueden reducirse', detailsMuchLower: 'Detalles: pueden reducirse mucho', resolutionUnchanged: 'Resolución: sin cambios',
    outputFormat: 'Formato de salida', pngLossless: 'PNG (sin pérdida)', targetSize: 'Tamaño objetivo (MB, opcional)', targetPlaceholder: 'p. ej., 2,5',
    process: 'Procesar localmente', processing: 'Procesando…', download: 'Descargar resultado', downloadStarted: 'Descarga iniciada ✓', downloadAgain: 'Descargar de nuevo', downloadStatus: 'Descarga iniciada. Revisa tu carpeta de descargas.',
    original: 'Original', result: 'Resultado', originalPreview: 'Vista previa del archivo original', resultPreview: 'Vista previa del resultado', footer: 'Todo el procesamiento se realiza en tu dispositivo.', opening: 'Abriendo conversor…', openingFailed: 'No se pudo abrir la ventana. Vuelve a cargar la extensión.',
    pdfWarning: 'Aviso: puede haber una gran pérdida de calidad. Las páginas pueden verse borrosas; se perderán el texto buscable, los enlaces y los formularios.',
    pngWarning: 'Aviso: PNG sigue codificándose sin pérdida, pero la resolución puede bajar mucho. Pueden perderse detalles finos.',
    imageWarning: 'Aviso: puede haber una gran pérdida de calidad. Los detalles finos y el texto de la imagen pueden verse borrosos.',
    pdfOriginalNotice: 'Se conserva el original: el texto, los enlaces, los formularios y los vectores no cambian. Elige otro modo para obtener un PDF más pequeño.',
    pdfRasterNotice: 'PDF basado en imágenes: se perderán el texto buscable, los enlaces, los formularios, los vectores y las firmas digitales. El archivo original no cambia.',
    pdfOriginalEstimate: 'Ahorro estimado: 0 %. El PDF no cambia.', calculating: 'Ahorro estimado: calculando localmente…',
    largePdfEstimate: 'Para PDF de más de 30 MB, el porcentaje aparece después del procesamiento.', largeImageEstimate: 'Para imágenes de más de 30 MB, el porcentaje aparece después del procesamiento.',
    tooManyPagesEstimate: 'Actualmente no se pueden procesar PDF de más de 200 páginas.',
    pdfNoSaving: 'Sin ahorro con esta configuración: original {original}, proyección {projected}. Este PDF ya es más pequeño que la versión basada en imágenes. {sampleNote}Una compresión mayor o un tamaño objetivo pueden ayudar, pero se perderán el texto buscable y otras funciones del PDF.',
    pdfSaving: 'Ahorro estimado: {saving} ({original} → {projected}). {sampleNote} No se garantiza el tamaño objetivo.',
    sampleOtherPages: 'Estimación de la página 1; otras páginas pueden variar. ', sampleOnePage: 'Resultado de prueba calculado localmente.', sampleManyPages: 'Proyección aproximada de la página 1; otras páginas pueden variar mucho.',
    noSavingImage: 'Sin ahorro con esta configuración: original {original}, versión de prueba {candidate}. {reason}',
    onePixelReason: 'La imagen solo tiene {dimensions} y no se puede reducir más.',
    pngReason: 'Este PNG ya es eficiente. Prueba una compresión mayor o, si está permitido, WebP/JPEG.',
    imageReason: 'El original ya está comprimido de forma eficiente; prueba una configuración más intensa.',
    imageEstimate: 'Cambio de tamaño estimado: {saving} ({original} → {candidate}). Resultado de prueba calculado localmente{resolution}.',
    resolutionChange: '; resolución {from} → {to}', noEstimate: 'No hay una vista previa fiable; el tamaño real se mostrará después del procesamiento.',
    aboutSmaller: 'aprox. un {percent} % más pequeño', aboutLarger: 'ninguno (resultado aprox. un {percent} % más grande)', aboutZero: 'aprox. 0 %',
    unsupported: 'Este formato todavía no es compatible.', emptyFile: 'El archivo está vacío. Selecciona otro.', fileTooLarge: 'Actualmente no se pueden procesar archivos de más de 100 MB.', imageKind: 'IMAGEN',
    imageEncodeError: 'El navegador no pudo codificar la imagen.', pdfPassword: 'No se pueden procesar PDF protegidos con contraseña.', pdfReadError: 'El PDF está dañado o no se puede leer en este navegador.',
    pdfJpegError: 'Este navegador no pudo codificar la página del PDF como JPEG.', cancelled: 'Procesamiento cancelado.', canvasMemory: 'No hay suficiente memoria gráfica para esta página del PDF.',
    pageProgress: 'Procesando página {page} de {total}…', tooManyPages: 'Actualmente no se pueden procesar PDF de más de 200 páginas.', variantProgress: 'Calculando versión {index} de {total}…',
    invalidTarget: 'Introduce un tamaño objetivo válido en MB.', processingLocal: 'Procesando el archivo localmente…',
    targetMissed: ' No se alcanzó el tamaño objetivo.', savedResult: '{result} en lugar de {original} · {percent} % más pequeño.{target}', convertedLarger: 'Convertido: {result}. El formato elegido es más grande que el original.{target}',
    noSmallerResult: 'No se pudo crear un archivo más pequeño. El original sigue siendo la mejor versión.{onePixel}{target}', onePixelResult: ' Esta imagen solo tiene 1 × 1 píxeles.',
    pdfResultWarning: ' El nuevo PDF contiene imágenes; no incluye texto buscable, enlaces ni formularios.',
    actualSaving: 'Ahorro real: {percent} %. Resultado: {result}.', actualNoSaving: 'Ahorro real: ninguno. Resultado: {result}.', processingError: 'No se pudo procesar el archivo.',
    fileSuffix: '-comprimido',
  },
  fr: {
    appName: 'Convertisseur local', eyebrow: 'PRIVÉ · HORS LIGNE', intro: 'Traitez des images et des PDF sans que les fichiers quittent votre appareil.', languageButton: 'Langue : {language}', autoLanguage: 'Automatique', languageSaveError: 'Impossible d’enregistrer la langue choisie dans ce navigateur.',
    chooseFile: 'Choisir un fichier', dropFile: 'Déposez un fichier ici', orChoose: 'ou cliquez pour choisir', supportedFormats: 'JPG, PNG, WebP et PDF', removeFile: 'Supprimer le fichier',
    compressionStrength: 'Intensité de compression', gentle: 'Douce', balanced: 'Équilibrée', strong: 'Forte', gentleHint: 'Douce · qualité élevée', strongHint: 'Forte · qualité réduite',
    qualityHigh: 'Qualité : élevée', qualityUnchanged: 'Qualité : inchangée', qualityReduced: 'Qualité : réduite', qualityMuchLower: 'Qualité : nettement réduite', detailsReduced: 'Détails : réduction possible', detailsMuchLower: 'Détails : forte réduction possible', resolutionUnchanged: 'Résolution : inchangée',
    outputFormat: 'Format de sortie', pngLossless: 'PNG (sans perte)', targetSize: 'Taille cible (Mo, facultatif)', targetPlaceholder: 'p. ex. 2,5',
    process: 'Traiter localement', processing: 'Traitement en cours…', download: 'Télécharger le résultat', downloadStarted: 'Téléchargement lancé ✓', downloadAgain: 'Télécharger à nouveau', downloadStatus: 'Téléchargement lancé. Vérifiez votre dossier Téléchargements.',
    original: 'Original', result: 'Résultat', originalPreview: 'Aperçu du fichier original', resultPreview: 'Aperçu du résultat', footer: 'Le traitement s’effectue entièrement sur votre appareil.', opening: 'Ouverture du convertisseur…', openingFailed: 'Impossible d’ouvrir la fenêtre. Rechargez l’extension.',
    pdfWarning: 'Attention : une forte perte de qualité est possible. Les pages peuvent devenir floues ; le texte recherchable, les liens et les formulaires seront perdus.',
    pngWarning: 'Attention : le PNG reste encodé sans perte, mais la résolution peut beaucoup baisser. Les détails fins peuvent disparaître.',
    imageWarning: 'Attention : une forte perte de qualité est possible. Les détails fins et le texte de l’image peuvent devenir flous.',
    pdfOriginalNotice: 'Original conservé : le texte, les liens, les formulaires et les éléments vectoriels restent inchangés. Choisissez un autre mode pour réduire le PDF.',
    pdfRasterNotice: 'PDF basé sur des images : le texte recherchable, les liens, les formulaires, les éléments vectoriels et les signatures numériques seront perdus. Le fichier original reste inchangé.',
    pdfOriginalEstimate: 'Gain estimé : 0 %. Le PDF reste inchangé.', calculating: 'Gain estimé : calcul local en cours…',
    largePdfEstimate: 'Pour les PDF de plus de 30 Mo, le pourcentage apparaît après le traitement.', largeImageEstimate: 'Pour les images de plus de 30 Mo, le pourcentage apparaît après le traitement.',
    tooManyPagesEstimate: 'Les PDF de plus de 200 pages ne peuvent pas être traités actuellement.',
    pdfNoSaving: 'Aucun gain avec ce réglage : original {original}, estimation {projected}. Ce PDF est déjà plus petit que la version basée sur des images. {sampleNote}Une compression plus forte ou une taille cible peut aider, mais le texte recherchable et les fonctions PDF seront perdus.',
    pdfSaving: 'Gain estimé : {saving} ({original} → {projected}). {sampleNote} La taille cible n’est pas garantie.',
    sampleOtherPages: 'Estimation depuis la page 1 ; les autres pages peuvent différer. ', sampleOnePage: 'Résultat de test calculé localement.', sampleManyPages: 'Estimation approximative depuis la page 1 ; les autres pages peuvent beaucoup différer.',
    noSavingImage: 'Aucun gain avec ce réglage : original {original}, version test {candidate}. {reason}',
    onePixelReason: 'L’image ne mesure que {dimensions} et ne peut pas être réduite davantage.',
    pngReason: 'Ce PNG est déjà efficace. Essayez une compression plus forte ou, si c’est autorisé, WebP/JPEG.',
    imageReason: 'L’original est déjà bien compressé ; essayez un réglage plus fort.',
    imageEstimate: 'Variation estimée : {saving} ({original} → {candidate}). Résultat de test calculé localement{resolution}.',
    resolutionChange: ' ; résolution {from} → {to}', noEstimate: 'Aucun aperçu fiable disponible ; la taille réelle sera affichée après le traitement.',
    aboutSmaller: 'environ {percent} % plus petit', aboutLarger: 'aucun (résultat environ {percent} % plus grand)', aboutZero: 'environ 0 %',
    unsupported: 'Ce format n’est pas encore pris en charge.', emptyFile: 'Le fichier est vide. Choisissez-en un autre.', fileTooLarge: 'Les fichiers de plus de 100 Mo ne peuvent pas être traités actuellement.', imageKind: 'IMAGE',
    imageEncodeError: 'Le navigateur n’a pas pu encoder l’image.', pdfPassword: 'Les PDF protégés par mot de passe ne peuvent pas être traités.', pdfReadError: 'Le PDF est endommagé ou illisible dans ce navigateur.',
    pdfJpegError: 'Ce navigateur n’a pas pu encoder la page PDF en JPEG.', cancelled: 'Traitement annulé.', canvasMemory: 'La mémoire graphique est insuffisante pour cette page PDF.',
    pageProgress: 'Traitement de la page {page} sur {total}…', tooManyPages: 'Les PDF de plus de 200 pages ne peuvent pas être traités actuellement.', variantProgress: 'Calcul de la version {index} sur {total}…',
    invalidTarget: 'Saisissez une taille cible valide en Mo.', processingLocal: 'Traitement local du fichier…',
    targetMissed: ' La taille cible n’a pas été atteinte.', savedResult: '{result} au lieu de {original} · {percent} % plus petit.{target}', convertedLarger: 'Converti : {result}. Le format choisi est plus volumineux que l’original.{target}',
    noSmallerResult: 'Impossible de créer un fichier plus petit. L’original reste la meilleure version.{onePixel}{target}', onePixelResult: ' Cette image ne mesure que 1 × 1 pixel.',
    pdfResultWarning: ' Le nouveau PDF est composé d’images ; il ne contient ni texte recherchable, ni liens, ni formulaires.',
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
