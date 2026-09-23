import * as pdfjs from '../vendor/pdfjs/pdf.mjs';
import { applyStaticTranslations, getLanguagePreference, locale, setLanguagePreference, t } from './i18n.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;
applyStaticTranslations();

const $ = (selector) => document.querySelector(selector);
const languageButton = $('#language-button');
const languageMenu = $('#language-menu');
const languageCurrent = $('#language-current');
const dropzone = $('#dropzone');
const input = $('#file-input');
const workspace = $('#workspace');
const quality = $('#quality');
const qualityOutput = $('#quality-output');
const qualityStatus = $('#quality-status');
const qualityWarning = $('#quality-warning');
const format = $('#format');
const formatRow = $('#format-row');
const preview = $('#preview');
const originalPreview = $('#original-preview');
const resultPreview = $('#result-preview');
const targetRow = $('#target-row');
const targetSize = $('#target-size');
const progress = $('#progress');
const notice = $('#pdf-notice');
const estimate = $('#estimate');
const errorBox = $('#error');
const resultStats = $('#result-stats');
const processButton = $('#process');
const downloadButton = $('#download');
const downloadStatus = $('#download-status');
let selectedFile = null;
let result = null;
let resultExtension = null;
let previewUrls = [];
let jobId = 0;
let downloadTimer = null;
let estimateTimer = null;
let estimateVersion = 0;
let imageEstimate = null;
let resultInfo = null;

const formatBytes = (bytes) => {
  const units = locale === 'fr' ? ['o', 'Ko', 'Mo'] : ['B', 'KB', 'MB'];
  if (bytes < 1024) return `${bytes} ${units[0]}`;
  const number = (value, digits) => new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
  if (bytes < 1024 ** 2) return `${number(bytes / 1024, 1)} ${units[1]}`;
  return `${number(bytes / 1024 ** 2, 2)} ${units[2]}`;
};

function showError(message) { errorBox.textContent = message; errorBox.classList.remove('hidden'); }
function clearMessages() {
  result = null;
  resultInfo = null;
  if (downloadTimer) clearTimeout(downloadTimer);
  downloadTimer = null;
  downloadButton.disabled = false;
  downloadButton.textContent = t('download');
  downloadStatus.classList.add('hidden');
  downloadStatus.textContent = '';
  errorBox.classList.add('hidden');
  resultStats.classList.add('hidden');
  downloadButton.classList.add('hidden');
  preview.classList.add('hidden');
  progress.classList.add('hidden');
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls = [];
}
function qualityName(strength) { return t(strength <= 30 ? 'gentle' : strength <= 65 ? 'balanced' : 'strong'); }
function cancelEstimate() {
  estimateVersion += 1;
  if (estimateTimer) clearTimeout(estimateTimer);
  estimateTimer = null;
  imageEstimate = null;
}
function estimateSaving(originalSize, resultSize) {
  const percent = Math.round((originalSize - resultSize) / originalSize * 100);
  return t(percent > 0 ? 'aboutSmaller' : percent < 0 ? 'aboutLarger' : 'aboutZero', { percent: Math.abs(percent) });
}
function renderResultStats() {
  if (!result || !resultInfo) return;
  const { file, targetBytes, sameFormat, isPdf, value, keepOriginal, onePixel } = resultInfo;
  const saved = file.size - result.size;
  const target = targetBytes && result.size > targetBytes ? t('targetMissed') : '';
  resultStats.textContent = saved > 0
    ? t('savedResult', { result: formatBytes(result.size), original: formatBytes(file.size), percent: Math.round(saved / file.size * 100), target })
    : !sameFormat
      ? t('convertedLarger', { result: formatBytes(result.size), target })
      : t('noSmallerResult', { onePixel: onePixel ? t('onePixelResult') : '', target });
  if (isPdf && value < 70 && !keepOriginal) resultStats.textContent += t('pdfResultWarning');
  estimate.textContent = saved > 0
    ? t('actualSaving', { percent: Math.round(saved / file.size * 100), result: formatBytes(result.size) })
    : t('actualNoSaving', { result: formatBytes(result.size) });
}

function refreshLanguageButton() {
  const names = { en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français' };
  languageCurrent.textContent = locale.toUpperCase();
  languageButton.setAttribute('aria-label', t('languageButton', { language: names[locale] }));
  const preference = getLanguagePreference();
  for (const button of languageMenu.querySelectorAll('button[data-language]')) {
    button.setAttribute('aria-pressed', String(button.dataset.language === preference));
  }
}

function closeLanguageMenu() {
  languageMenu.classList.add('hidden');
  languageButton.setAttribute('aria-expanded', 'false');
}

refreshLanguageButton();
languageButton.addEventListener('click', () => {
  const open = languageMenu.classList.toggle('hidden') === false;
  languageButton.setAttribute('aria-expanded', String(open));
});
languageMenu.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-language]');
  if (!button) return;
  if (!setLanguagePreference(button.dataset.language)) {
    showError(t('languageSaveError'));
    return;
  }
  closeLanguageMenu();
  languageButton.focus();
  applyStaticTranslations();
  refreshLanguageButton();
  errorBox.classList.add('hidden');
  if (selectedFile) {
    $('#file-size').textContent = formatBytes(selectedFile.size);
    $('#file-kind').textContent = selectedFile.type === 'application/pdf' ? 'PDF' : t('imageKind');
    updateEstimate();
    if (resultInfo) {
      cancelEstimate();
      renderResultStats();
      const conversion = resultInfo.imageConversion;
      if (conversion && format.value === 'image/png' && conversion.sourceWidth === conversion.width && conversion.sourceHeight === conversion.height) {
        qualityStatus.className = 'quality-status quality-good';
        qualityStatus.textContent = t('resolutionUnchanged');
        qualityWarning.classList.add('hidden');
      }
    } else if (processButton.disabled) {
      cancelEstimate();
      progress.textContent = t('processingLocal');
    }
  }
  processButton.textContent = t(processButton.disabled ? 'processing' : 'process');
  if (!downloadStatus.classList.contains('hidden')) {
    downloadStatus.textContent = t('downloadStatus');
    downloadButton.textContent = t(downloadButton.disabled ? 'downloadStarted' : 'downloadAgain');
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.language-picker')) closeLanguageMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !languageMenu.classList.contains('hidden')) {
    closeLanguageMenu();
    languageButton.focus();
  }
});

function updateEstimate() {
  if (!selectedFile) return;
  cancelEstimate();
  const version = estimateVersion;
  const file = selectedFile;
  const strength = Number(quality.value);
  const value = 100 - strength;
  const isPdf = selectedFile.type === 'application/pdf';
  const highLoss = strength > 65;
  const color = highLoss ? '#b73838' : strength > 30 ? '#a26c18' : '#29805a';
  quality.style.setProperty('--slider-color', color);
  qualityOutput.style.setProperty('--slider-color', color);
  qualityOutput.textContent = qualityName(strength);
  qualityStatus.className = `quality-status ${highLoss ? 'quality-low' : strength > 30 ? 'quality-medium' : 'quality-good'}`;
  qualityStatus.textContent = isPdf && strength <= 30
    ? t('qualityUnchanged')
    : !isPdf && format.value === 'image/png'
      ? t(highLoss ? 'detailsMuchLower' : strength > 30 ? 'detailsReduced' : 'qualityHigh')
      : t(highLoss ? 'qualityMuchLower' : strength > 30 ? 'qualityReduced' : 'qualityHigh');
  qualityWarning.classList.toggle('hidden', !highLoss);
  qualityWarning.textContent = highLoss
    ? t(isPdf ? 'pdfWarning' : format.value === 'image/png' ? 'pngWarning' : 'imageWarning')
    : '';
  targetRow.classList.toggle('hidden', !isPdf || value >= 70);
  notice.classList.toggle('hidden', !isPdf);
  notice.textContent = isPdf
    ? t(value >= 70 ? 'pdfOriginalNotice' : 'pdfRasterNotice')
    : '';
  estimate.textContent = isPdf && value >= 70
    ? t('pdfOriginalEstimate')
    : t('calculating');
  estimate.classList.remove('hidden');
  if (isPdf && value >= 70) return;
  estimateTimer = setTimeout(async () => {
    estimateTimer = null;
    try {
      if (isPdf) {
        if (file.size > 30 * 1024 * 1024) {
          estimate.textContent = t('largePdfEstimate');
          return;
        }
        const { pdf, task } = await openPdf(file);
        try {
          if (version !== estimateVersion) return;
          if (pdf.numPages > 200) {
            estimate.textContent = t('tooManyPagesEstimate');
            return;
          }
          const firstPage = { numPages: 1, getPage: () => pdf.getPage(1) };
          const sample = await rasterizePdf(firstPage, profiles(value)[0], jobId);
          if (version !== estimateVersion) return;
          const projectedSize = sample.size * pdf.numPages;
          estimate.textContent = projectedSize >= file.size
            ? t('pdfNoSaving', { original: formatBytes(file.size), projected: formatBytes(projectedSize), sampleNote: pdf.numPages > 1 ? t('sampleOtherPages') : '' })
            : t('pdfSaving', { saving: estimateSaving(file.size, projectedSize), original: formatBytes(file.size), projected: formatBytes(projectedSize), sampleNote: t(pdf.numPages === 1 ? 'sampleOnePage' : 'sampleManyPages') });
        } finally { await task.destroy(); }
      } else {
        if (file.size > 30 * 1024 * 1024) {
          estimate.textContent = t('largeImageEstimate');
          return;
        }
        const conversion = await compressImage(file, format.value, value);
        if (version !== estimateVersion) return;
        imageEstimate = { file, format: format.value, value, conversion };
        const sameFormat = file.type === format.value;
        const { blob, sourceWidth, sourceHeight, width, height } = conversion;
        if (format.value === 'image/png' && sourceWidth === width && sourceHeight === height) {
          qualityStatus.className = 'quality-status quality-good';
          qualityStatus.textContent = t('resolutionUnchanged');
          qualityWarning.classList.add('hidden');
        }
        const dimensions = `${sourceWidth} × ${sourceHeight} px`;
        estimate.textContent = sameFormat && blob.size >= file.size
          ? t('noSavingImage', { original: formatBytes(file.size), candidate: formatBytes(blob.size), reason: sourceWidth === 1 && sourceHeight === 1 ? t('onePixelReason', { dimensions }) : t(format.value === 'image/png' ? 'pngReason' : 'imageReason') })
          : t('imageEstimate', { saving: estimateSaving(file.size, blob.size), original: formatBytes(file.size), candidate: formatBytes(blob.size), resolution: width !== sourceWidth || height !== sourceHeight ? t('resolutionChange', { from: dimensions, to: `${width} × ${height} px` }) : '' });
      }
    } catch (error) {
      if (version === estimateVersion) estimate.textContent = t('noEstimate');
    }
  }, isPdf ? 500 : 300);
}

function selectFile(file) {
  cancelEstimate();
  clearMessages();
  if (!file) return;
  const valid = file.type === 'application/pdf' || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  if (!valid) { showError(t('unsupported')); return; }
  if (file.size === 0) { showError(t('emptyFile')); return; }
  if (file.size > 100 * 1024 * 1024) { showError(t('fileTooLarge')); return; }
  jobId += 1;
  selectedFile = file; result = null;
  $('#file-name').textContent = file.name;
  $('#file-size').textContent = formatBytes(file.size);
  $('#file-kind').textContent = file.type === 'application/pdf' ? 'PDF' : t('imageKind');
  formatRow.classList.toggle('hidden', file.type === 'application/pdf');
  if (file.type !== 'application/pdf') format.value = file.type;
  updateEstimate();
  workspace.classList.remove('hidden');
}

dropzone.addEventListener('click', () => input.click());
dropzone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') input.click(); });
input.addEventListener('change', () => selectFile(input.files[0]));
['dragenter', 'dragover'].forEach((name) => dropzone.addEventListener(name, (event) => { event.preventDefault(); dropzone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach((name) => dropzone.addEventListener(name, (event) => { event.preventDefault(); dropzone.classList.remove('dragging'); }));
dropzone.addEventListener('drop', (event) => selectFile(event.dataTransfer.files[0]));
$('#remove-file').addEventListener('click', () => { jobId += 1; cancelEstimate(); selectedFile = null; input.value = ''; clearMessages(); workspace.classList.add('hidden'); estimate.classList.add('hidden'); });
quality.addEventListener('input', () => { jobId += 1; clearMessages(); updateEstimate(); });
format.addEventListener('change', () => { jobId += 1; clearMessages(); updateEstimate(); });
targetSize.addEventListener('input', () => { jobId += 1; clearMessages(); });

async function compressImage(file, outputType, value) {
  const bitmap = await createImageBitmap(file);
  const maxDimension = value < 35 ? 1800 : value < 70 ? 2400 : 3200;
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  const strength = 100 - value;
  const pngScale = outputType === 'image/png' && strength > 30 ? 1 - .5 * (strength - 30) / 60 : 1;
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight)) * pngScale;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d', { alpha: outputType !== 'image/jpeg' });
  if (outputType === 'image/jpeg') { context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encoderQuality = Math.max(.1, Math.min(1, value / 100));
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, encoderQuality));
  if (!blob) throw new Error(t('imageEncodeError'));
  return { blob, sourceWidth, sourceHeight, width: canvas.width, height: canvas.height };
}

function pdfResources() {
  return {
    cMapUrl: new URL('../vendor/pdfjs/cmaps/', import.meta.url).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('../vendor/pdfjs/standard_fonts/', import.meta.url).href,
    wasmUrl: new URL('../vendor/pdfjs/wasm/', import.meta.url).href,
    iccUrl: new URL('../vendor/pdfjs/iccs/', import.meta.url).href,
    stopAtErrors: true,
    isEvalSupported: false,
  };
}

async function openPdf(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data, ...pdfResources() });
  try { return { pdf: await task.promise, task }; }
  catch (error) {
    await task.destroy();
    if (error?.name === 'PasswordException') throw new Error(t('pdfPassword'));
    throw new Error(t('pdfReadError'));
  }
}

function profiles(value) {
  const ratio = value < 35 ? (value - 10) / 25 : (value - 35) / 35;
  const scale = value < 35 ? .7 + .3 * ratio : 1 + .45 * ratio;
  const quality = value < 35 ? .34 + .22 * ratio : .55 + .22 * ratio;
  return [
    { scale, quality },
    { scale: scale * .82, quality: Math.max(.25, quality - .12) },
    { scale: scale * .68, quality: Math.max(.2, quality - .22) },
  ];
}

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (blob?.type === 'image/jpeg') resolve(blob);
    else reject(new Error(t('pdfJpegError')));
  }, 'image/jpeg', quality));
}

async function rasterizePdf(source, profile, token) {
  const output = await window.PDFLib.PDFDocument.create();
  for (let number = 1; number <= source.numPages; number += 1) {
    if (token !== jobId) throw new Error(t('cancelled'));
    const sourcePage = await source.getPage(number);
    const pageSize = sourcePage.getViewport({ scale: 1 });
    const scale = Math.min(profile.scale, Math.sqrt(6_000_000 / (pageSize.width * pageSize.height)));
    const viewport = sourcePage.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error(t('canvasMemory'));
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await sourcePage.render({ canvas, canvasContext: context, viewport }).promise;
    const jpeg = await canvasToJpeg(canvas, profile.quality);
    canvas.width = 0; canvas.height = 0;
    const embedded = await output.embedJpg(await jpeg.arrayBuffer());
    const page = output.addPage([pageSize.width, pageSize.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: pageSize.width, height: pageSize.height });
    sourcePage.cleanup();
    progress.textContent = t('pageProgress', { page: number, total: source.numPages });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return new Blob([await output.save({ useObjectStreams: true })], { type: 'application/pdf' });
}

async function compressPdf(file, value, targetBytes, token) {
  const { pdf, task } = await openPdf(file);
  try {
    if (pdf.numPages > 200) throw new Error(t('tooManyPages'));
    if (value >= 70) return file;
    const variants = profiles(value);
    let smallest = null;
    for (let index = 0; index < (targetBytes ? variants.length : 1); index += 1) {
      progress.textContent = t('variantProgress', { index: index + 1, total: targetBytes ? variants.length : 1 });
      const candidate = await rasterizePdf(pdf, variants[index], token);
      if (!smallest || candidate.size < smallest.size) smallest = candidate;
      if (targetBytes && candidate.size <= targetBytes) return candidate;
    }
    return smallest;
  } finally { await task.destroy(); }
}

async function pdfPreview(blob) {
  const { pdf, task } = await openPdf(blob);
  try {
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(1, 700 / base.width) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
    return canvas.toDataURL('image/png');
  } finally { await task.destroy(); }
}

processButton.addEventListener('click', async () => {
  if (!selectedFile) return;
  const file = selectedFile;
  const cachedImage = imageEstimate;
  cancelEstimate();
  const token = ++jobId;
  clearMessages();
  const targetMB = Number(targetSize.value.replace(',', '.'));
  if (file.type === 'application/pdf' && targetSize.value && (!Number.isFinite(targetMB) || targetMB <= 0)) {
    showError(t('invalidTarget')); return;
  }
  processButton.disabled = true;
  processButton.textContent = t('processing');
  progress.classList.remove('hidden');
  progress.textContent = t('processingLocal');
  try {
    const value = 100 - Number(quality.value);
    const isPdf = file.type === 'application/pdf';
    const targetBytes = isPdf && targetSize.value ? targetMB * 1024 ** 2 : null;
    const imageConversion = isPdf ? null : cachedImage?.file === file && cachedImage.format === format.value && cachedImage.value === value
      ? cachedImage.conversion
      : await compressImage(file, format.value, value);
    const candidate = isPdf ? await compressPdf(file, value, targetBytes, token) : imageConversion.blob;
    if (token !== jobId) return;
    const sameFormat = isPdf || file.type === format.value;
    const keepOriginal = sameFormat && candidate.size >= file.size;
    result = keepOriginal ? file : candidate;
    resultExtension = isPdf ? 'pdf' : (keepOriginal ? file.type : format.value).split('/')[1].replace('jpeg', 'jpg');
    resultInfo = { file, targetBytes, sameFormat, isPdf, value, keepOriginal, onePixel: !isPdf && imageConversion.sourceWidth === 1 && imageConversion.sourceHeight === 1, imageConversion };
    renderResultStats();
    resultStats.classList.remove('hidden');
    downloadButton.classList.remove('hidden');
    if (isPdf) {
      originalPreview.src = await pdfPreview(file);
      resultPreview.src = keepOriginal ? originalPreview.src : await pdfPreview(result);
    } else {
      const originalUrl = URL.createObjectURL(file);
      const resultUrl = URL.createObjectURL(result);
      previewUrls.push(originalUrl, resultUrl);
      originalPreview.src = originalUrl;
      resultPreview.src = resultUrl;
    }
    if (token === jobId) preview.classList.remove('hidden');
  } catch (error) { if (token === jobId) showError(error instanceof Error ? error.message : t('processingError')); }
  finally {
    progress.classList.add('hidden');
    processButton.disabled = false;
    processButton.textContent = t('process');
  }
});

downloadButton.addEventListener('click', () => {
  if (!result || !selectedFile || downloadButton.disabled) return;
  const downloadedResult = result;
  const baseName = selectedFile.name.replace(/\.[^.]+$/, '');
  const url = URL.createObjectURL(result); const link = document.createElement('a');
  link.href = url; link.download = `${baseName}${t('fileSuffix')}.${resultExtension}`; link.click();
  downloadButton.disabled = true;
  downloadButton.textContent = t('downloadStarted');
  downloadStatus.textContent = t('downloadStatus');
  downloadStatus.classList.remove('hidden');
  downloadTimer = setTimeout(() => {
    if (result !== downloadedResult) return;
    downloadButton.disabled = false;
    downloadButton.textContent = t('downloadAgain');
    downloadTimer = null;
  }, 2000);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
});
