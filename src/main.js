import { locale, t } from './i18n.js';
import { initPreferences } from './preferences.js';
import { compressImage, compressImageToTarget, compressPdf, estimatePdf, pdfPreview, validateFile, MAX_ESTIMATE_SIZE } from './conversion.js';
import { imageToPdf, imagesToPdf, pdfToImagesZip, pdfToText } from './extra-conversion.js';
import { docxToText, xlsxToCsv } from './office-conversion.js';
import { officeToPdf, pptxToText } from './office-conversion.js';
import { convertMedia, mediaSupport } from './media-conversion.js';
import { zipBlobs } from './zip.js';
import { fillUploadField } from './upload-field.js';

const $ = (id) => document.getElementById(id);
const quality = $('quality');
const format = $('format');
const target = $('target-size');
let file = null;
let result = null;
let operation = null;
let estimation = null;
let estimateTimer;
let estimateData = null;
let imageCache = null;
let selectionVersion = 0;
let downloadTimer;
let downloadStarted = false;
let progressMessage = null;
let mergedPdf = null;
let uploadTabId = Number(new URL(location.href).searchParams.get('sourceTab')) || null;
const items = [];
let nextItemId = 0;
const MAX_BATCH_FILES = 20;
const previewUrls = [];
const imageOutputs = [['image/jpeg', 'JPEG'], ['image/png', 'PNG'], ['image/webp', 'WebP'], ['application/pdf', 'PDF']];
const avifCanvas = document.createElement('canvas');
avifCanvas.width = avifCanvas.height = 1;
if (avifCanvas.toDataURL('image/avif').startsWith('data:image/avif')) imageOutputs.splice(3, 0, ['image/avif', 'AVIF']);
const formats = {
  'image/jpeg': imageOutputs,
  'image/png': imageOutputs,
  'image/webp': imageOutputs,
  'image/avif': imageOutputs,
  'image/gif': imageOutputs,
  'image/tiff': imageOutputs,
  'image/heic': imageOutputs,
  'application/pdf': [['application/pdf', 'PDF'], ['text/plain', 'TXT'], ['application/x-localvert-jpeg-pages', 'JPG pages (ZIP)'], ['application/x-localvert-png-pages', 'PNG pages (ZIP)']],
  'audio/mpeg': [['audio/mpeg', 'MP3'], ['audio/ogg', 'Opus (OGG)'], ['audio/flac', 'FLAC'], ['audio/wav', 'WAV']],
  'audio/wav': [['audio/mpeg', 'MP3'], ['audio/ogg', 'Opus (OGG)'], ['audio/flac', 'FLAC'], ['audio/wav', 'WAV']],
  'audio/ogg': [['audio/mpeg', 'MP3'], ['audio/ogg', 'Opus (OGG)'], ['audio/flac', 'FLAC'], ['audio/wav', 'WAV']],
  'audio/flac': [['audio/mpeg', 'MP3'], ['audio/ogg', 'Opus (OGG)'], ['audio/flac', 'FLAC'], ['audio/wav', 'WAV']],
  'video/mp4': [['video/mp4', 'MP4'], ['video/webm', 'WebM']],
  'video/webm': [['video/webm', 'WebM'], ['video/mp4', 'MP4']],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [['application/pdf', 'PDF'], ['text/plain', 'TXT']],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [['application/pdf', 'PDF'], ['text/csv', 'CSV']],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [['application/pdf', 'PDF'], ['text/plain', 'TXT']],
};
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'application/pdf': 'pdf', 'application/zip': 'zip', 'text/plain': 'txt', 'text/csv': 'csv', 'audio/wav': 'wav', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/flac': 'flac', 'video/mp4': 'mp4', 'video/webm': 'webm' };
const mediaCapabilities = new Map();
let mediaCapabilityCheck;

function availableFormats(type) {
  const options = formats[type];
  const supported = options.filter(([output]) => mediaCapabilities.get(output) !== false);
  return supported.length ? supported : options;
}

async function checkMediaCapabilities() {
  mediaCapabilityCheck ??= Promise.all(['audio/mpeg', 'audio/ogg', 'audio/flac', 'audio/wav', 'video/mp4', 'video/webm'].map(async (type) => {
    try { mediaCapabilities.set(type, await mediaSupport(type)); }
    catch { mediaCapabilities.set(type, false); }
  }));
  await mediaCapabilityCheck;
}

function formatBytes(bytes) {
  const units = locale === 'fr' ? ['o', 'Ko', 'Mo'] : ['B', 'KB', 'MB'];
  const index = bytes < 1024 ? 0 : bytes < 1024 ** 2 ? 1 : 2;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: index ? 2 : 0 }).format(bytes / 1024 ** index)} ${units[index]}`;
}

function showError(message) {
  $('error').textContent = message;
  $('error').hidden = false;
}

function settings() {
  const strength = Number(quality.value);
  const isPdf = file?.type === 'application/pdf';
  return { strength, value: 100 - strength, isPdf, outputType: format.value };
}

function imageOptions() {
  const raw = $('max-dimension').value.trim();
  const maxDimension = raw ? Number(raw) : null;
  if (raw && (!Number.isInteger(maxDimension) || maxDimension < 1 || maxDimension > 10000)) throw new Error(t('invalidDimension'));
  return { maxDimension, rotation: Number($('rotation').value), squareCrop: $('square-crop').checked };
}

function targetBytesFor(source, outputType) {
  const enabled = source.type.startsWith('image/') && outputType.startsWith('image/')
    || source.type === 'application/pdf' && outputType === 'application/pdf';
  const raw = enabled ? target.value.trim() : '';
  if (!raw) return null;
  const bytes = Number(raw.replace(',', '.')) * 1024 ** 2;
  if (!Number.isFinite(bytes) || bytes <= 0) throw new Error(t('invalidTarget'));
  return bytes;
}

function setFormats(type) {
  const options = availableFormats(type);
  format.replaceChildren(...options.map(([value, label]) => new Option(label, value)));
  format.value = options.some(([value]) => value === type) ? type : options[0][0];
}

function stopEstimate() {
  clearTimeout(estimateTimer);
  estimation?.abort();
  estimation = null;
}

function setBusy(busy) {
  for (const control of [quality, format, target, $('max-dimension'), $('rotation'), $('square-crop'), $('process')]) control.disabled = busy;
  $('cancel').hidden = !busy;
  $('progress').hidden = !busy;
  $('estimate').hidden = busy || !file || !!result;
  $('workspace').setAttribute('aria-busy', String(busy));
  $('process').textContent = t(busy ? 'processing' : 'process');
  if (items.length > 1) renderBatch();
}

function stopOperation() {
  operation?.abort();
  operation = null;
  setBusy(false);
}

function clearResult() {
  result = null;
  $('process').hidden = false;
  $('download').hidden = true;
  downloadStarted = false;
  clearTimeout(downloadTimer);
  $('download').disabled = false;
  $('download-status').hidden = true;
  $('result-panel').hidden = true;
  $('preview').hidden = true;
  $('preview-error').hidden = true;
  $('original-preview').removeAttribute('src');
  $('result-preview').removeAttribute('src');
  previewUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  $('app').classList.remove('has-result');
  $('upload-field').hidden = true;
  $('upload-warning').hidden = true;
  $('upload-status').hidden = true;
}

function renderSettings() {
  if (!file) return;
  const { strength, isPdf, outputType } = settings();
  const isAudio = file.type.startsWith('audio/');
  const isVideo = file.type.startsWith('video/');
  const isOffice = file.type.includes('officedocument');
  const isPdfText = isPdf && outputType === 'text/plain';
  const hasQuality = !isPdfText && !isOffice;
  const isImageOutput = file.type.startsWith('image/') && outputType.startsWith('image/');
  $('quality-row').hidden = !hasQuality;
  $('format-row').hidden = false;
  $('image-options').hidden = !isImageOutput;
  $('target-row').hidden = !isImageOutput && (!isPdf || outputType !== 'application/pdf');
  $('pdf-notice').hidden = !isPdf && !isOffice && !isAudio && !isVideo && !['image/gif', 'image/tiff', 'image/heic'].includes(file.type);
  $('pdf-notice').textContent = isOffice ? t(outputType === 'application/pdf' ? 'officePdfNotice' : outputType === 'text/csv' ? 'xlsxNotice' : 'docxNotice')
    : isAudio || isVideo ? t('mediaNotice')
      : ['image/gif', 'image/tiff'].includes(file.type) ? t('firstFrameNotice')
        : file.type === 'image/heic' ? t('heicNotice')
    : isPdfText ? t('pdfTextNotice') : outputType.includes('localvert-') ? t('pdfImageNotice') : t(strength <= 30 ? 'pdfStructureNotice' : 'pdfRasterNotice');
  $('file-name').textContent = file.name;
  $('file-name').title = file.name;
  $('file-size').textContent = formatBytes(file.size);
  $('file-kind').textContent = isOffice ? (file.type.includes('wordprocessingml') ? 'DOCX' : file.type.includes('spreadsheetml') ? 'XLSX' : 'PPTX')
    : file.type === 'audio/mpeg' ? 'MP3' : file.type === 'audio/wav' ? 'WAV' : isPdf ? 'PDF' : file.type.split('/')[1].toUpperCase().replace('JPEG', 'JPG');
  if (!hasQuality) { $('quality-warning').hidden = true; return; }
  const level = strength > 65 ? 'low' : strength > 30 ? 'medium' : 'good';
  $('workspace').dataset.quality = level;
  $('quality-output').textContent = t(strength <= 30 ? 'gentle' : strength <= 65 ? 'balanced' : 'strong');
  quality.setAttribute('aria-valuetext', $('quality-output').textContent);
  const unchangedPng = outputType === 'image/png' && imageCache && imageCache.sourceWidth === imageCache.width && imageCache.sourceHeight === imageCache.height && !target.value;
  const alreadyFits = isImageOutput && outputType === file.type && !$('max-dimension').value && !$('square-crop').checked && $('rotation').value === '0'
    && Number(target.value.replace(',', '.')) * 1024 ** 2 >= file.size;
  $('quality-status').className = `quality-status quality-${unchangedPng || alreadyFits ? 'good' : level}`;
  $('quality-status').textContent = t(alreadyFits ? 'qualityUnchanged' : isAudio || isVideo ? 'mediaQualityNotice' : unchangedPng ? 'resolutionUnchanged' : isPdf && strength <= 30 ? 'qualityUnchanged'
    : outputType === 'image/png' ? (strength > 65 ? 'detailsMuchLower' : strength > 30 ? 'detailsReduced' : 'qualityHigh')
      : strength > 65 ? 'qualityMuchLower' : strength > 30 ? 'qualityReduced' : 'qualityHigh');
  $('quality-warning').hidden = strength <= 65 || unchangedPng || alreadyFits;
  $('quality-warning').textContent = t(isAudio || isVideo ? 'mediaWarning' : isPdf ? 'pdfWarning' : outputType === 'image/png' ? 'pngWarning' : 'imageWarning');
}

function renderEstimate() {
  const estimate = $('estimate');
  estimate.hidden = !file || !!result || !!operation || estimateData?.key === 'noEstimate';
  if (!file || !estimateData) return;
  if (estimateData.key) {
    if (estimateData.key !== 'original') {
      estimate.textContent = t(estimateData.key);
      return;
    }
  }
  const { size = file.size, pages, image } = estimateData;
  const percent = Math.round((size / file.size - 1) * 100);
  const sameFormat = file.type === format.value;
  const note = sameFormat && size >= file.size ? t('estimateKeepOriginal')
    : pages > 1 ? t('estimateFirstPage')
      : image && (image.width !== image.sourceWidth || image.height !== image.sourceHeight)
        ? t('estimateResolution', { width: image.width, height: image.height }) : '';
  const heading = document.createElement('div');
  heading.className = 'estimate-heading';
  const label = document.createElement('span');
  label.textContent = t('estimateTitle');
  const change = document.createElement('strong');
  change.className = `estimate-change ${percent < 0 ? 'decrease' : percent > 0 ? 'increase' : ''}`;
  change.textContent = `${percent < 0 ? '−' : percent > 0 ? '+' : ''}${Math.abs(percent)} %`;
  heading.append(label, change);
  const sizes = document.createElement('div');
  sizes.className = 'estimate-sizes';
  sizes.textContent = `${formatBytes(file.size)} → ${formatBytes(size)}`;
  estimate.replaceChildren(heading, sizes);
  if (note) {
    const detail = document.createElement('small');
    detail.textContent = note;
    estimate.append(detail);
  }
}

function renderResult() {
  if (!result) return;
  const { blob, source, targetBytes, sameFormat, keepOriginal, isPdf, reducedFurther, image } = result;
  const saved = source.size - blob.size;
  const targetNote = targetBytes ? ` ${t(blob.size <= targetBytes ? 'targetReached' : 'targetNotReached')}` : '';
  $('result-stats').textContent = !sameFormat
    ? t('convertedResult', { result: formatBytes(blob.size), original: formatBytes(source.size), target: targetNote })
    : saved > 0
      ? t('savedResult', { result: formatBytes(blob.size), original: formatBytes(source.size), percent: Math.round(saved / source.size * 100), target: targetNote })
      : t('noSmallerResult', { onePixel: image?.sourceWidth === 1 && image?.sourceHeight === 1 ? t('onePixelResult') : '', target: targetNote });
  if (isPdf && !keepOriginal && result.blob.type === 'application/pdf') $('result-stats').textContent += t('pdfResultWarning');
  if (isPdf && result.blob.type === 'text/plain') $('result-stats').textContent += t('pdfTextResult');
  if (source.type.includes('officedocument')) $('result-stats').textContent += t('officeResultWarning');
  if (reducedFurther && !keepOriginal) $('result-stats').textContent += t('targetAdjusted');
  if (result.reason) $('result-stats').textContent += ` ${t(result.reason)}`;
  $('result-size').textContent = formatBytes(blob.size);
  $('download').textContent = t($('download').disabled ? 'downloadStarted' : downloadStarted ? 'downloadAgain' : 'download');
  $('download-status').textContent = t('downloadStatus');
  $('process').hidden = true;
  $('download').hidden = false;
  $('result-panel').hidden = false;
  $('app').classList.add('has-result');
  $('estimate').hidden = true;
  $('upload-field').hidden = !uploadTabId;
  $('upload-warning').hidden = !uploadTabId;
}

function render() {
  $('drop-label').textContent = t(items.length ? 'addFiles' : 'dropFile');
  renderSettings();
  renderEstimate();
  renderResult();
  if (items.length > 1) renderBatch();
  $('process').textContent = t(operation ? 'processing' : 'process');
  if (progressMessage) $('progress').textContent = t(progressMessage.key, progressMessage.values);
}

function scheduleEstimate() {
  stopEstimate();
  imageCache = null;
  if (!file) return;
  const source = file;
  const config = settings();
  const isImage = source.type.startsWith('image/');
  const estimable = (config.isPdf && config.outputType === 'application/pdf') || (isImage && config.outputType !== 'application/pdf');
  const key = !estimable || (isImage && target.value.trim()) ? 'noEstimate'
    : source.size > MAX_ESTIMATE_SIZE ? (config.isPdf ? 'largePdfEstimate' : 'largeImageEstimate') : 'calculating';
  estimateData = { key };
  render();
  if (key !== 'calculating') return;
  const controller = new AbortController();
  estimation = controller;
  estimateTimer = setTimeout(async () => {
    try {
      const data = config.isPdf ? await estimatePdf(source, config.value, controller.signal)
        : await compressImage(source, config.outputType, config.value, controller.signal, imageOptions());
      if (controller.signal.aborted) return;
      if (config.isPdf) estimateData = data;
      else {
        imageCache = data;
        estimateData = { size: data.blob.size, image: data };
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      estimateData = { key: 'noEstimate' };
    } finally {
      if (estimation === controller) { estimation = null; render(); }
    }
  }, config.isPdf ? 500 : 300);
}

async function selectFiles(candidates) {
  if (!candidates.length || operation) return;
  if (items.length + candidates.length > MAX_BATCH_FILES) return showError(t('batchLimit'));
  const version = ++selectionVersion;
  const accepted = [];
  const errors = [];
  for (const candidate of candidates) {
    try {
      const source = await validateFile(candidate);
      accepted.push({ id: ++nextItemId, source, result: null, error: '', status: 'batchReady', downloaded: false });
    } catch (error) { errors.push(`${candidate.name}: ${error.message}`); }
  }
  if (version !== selectionVersion) return;
  if (accepted.some(({ source }) => /^(audio|video)\//.test(source.type))) await checkMediaCapabilities();
  if (version !== selectionVersion) return;
  for (const item of accepted) {
    const options = availableFormats(item.source.type);
    item.outputType = item.source.type === 'audio/wav' && options.some(([type]) => type === 'audio/mpeg') ? 'audio/mpeg'
      : options.some(([type]) => type === item.source.type) ? item.source.type : options[0][0];
  }
  if (errors.length) showError(errors.join(' · '));
  else $('error').hidden = true;
  if (!accepted.length) return;
  if (!items.length) {
    $('max-dimension').value = '';
    $('rotation').value = '0';
    $('square-crop').checked = false;
    target.value = '';
  }
  mergedPdf = null;
  if (items.length === 1) {
    items[0].outputType = format.value;
    if (result) items[0].result = result;
  }
  items.push(...accepted);
  stopEstimate();
  clearResult();
  $('workspace').hidden = false;
  $('app').classList.add('has-file');
  showItems();
  render();
}

function showItems() {
  const batch = items.length > 1;
  $('single-workspace').hidden = batch;
  $('batch-workspace').hidden = !batch;
  $('workspace').hidden = !items.length;
  $('app').classList.toggle('has-file', !!items.length);
  if (!items.length) { file = null; render(); return; }
  if (batch) { file = null; renderBatch(); return; }
  file = items[0].source;
  setFormats(file.type);
  format.value = items[0].outputType;
  quality.value = $('batch-quality').value;
  target.value = '';
  if (items[0].result) { result = items[0].result; render(); }
  else scheduleEstimate();
}

function renderBatch() {
  if (items.length < 2) return;
  const busy = !!operation;
  const strength = Number($('batch-quality').value);
  $('batch-count').textContent = t('batchCount', { count: items.length });
  $('batch-quality').disabled = busy;
  $('batch-quality-output').textContent = t(strength <= 30 ? 'gentle' : strength <= 65 ? 'balanced' : 'strong');
  $('batch-quality').setAttribute('aria-valuetext', $('batch-quality-output').textContent);
  $('batch-workspace').dataset.quality = strength > 65 ? 'low' : strength > 30 ? 'medium' : 'good';
  const pdfRaster = strength > 30 && items.some((item) => item.source.type === 'application/pdf' && item.outputType === 'application/pdf');
  $('batch-pdf-notice').hidden = !pdfRaster && strength <= 65;
  $('batch-pdf-notice').textContent = t(pdfRaster ? 'batchPdfNotice' : 'qualityMuchLower');
  $('batch-process').disabled = busy;
  $('batch-process').textContent = t(busy ? 'processing' : 'batchProcess');
  $('batch-zip').hidden = !items.some((item) => item.result);
  $('batch-zip').disabled = busy;
  $('batch-cancel').hidden = !busy;
  $('merge-actions').hidden = !items.every((item) => item.source.type.startsWith('image/'));
  $('merge-pdf').disabled = busy;
  $('merge-download').hidden = !mergedPdf;
  $('merge-download').disabled = !!mergedPdf?.downloadBlocked;
  $('merge-download').textContent = t(mergedPdf?.downloadBlocked ? 'batchDownloadStarted' : mergedPdf?.downloaded ? 'downloadAgain' : 'batchDownload');
  $('merge-size').textContent = mergedPdf ? formatBytes(mergedPdf.blob.size) : '';
  const list = $('batch-list');
  list.replaceChildren(...items.map((item) => {
    const row = document.createElement('div');
    row.className = 'batch-item';
    row.dataset.id = item.id;
    const head = document.createElement('div');
    head.className = 'batch-item-head';
    const name = document.createElement('strong');
    name.className = 'batch-item-name';
    name.textContent = item.source.name;
    name.title = item.source.name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-button';
    remove.dataset.action = 'remove';
    remove.setAttribute('aria-label', `${t('removeFile')}: ${item.source.name}`);
    remove.title = t('removeFile');
    remove.disabled = busy;
    remove.textContent = '×';
    head.append(name, remove);
    const details = document.createElement('div');
    details.className = 'batch-item-details';
    const size = document.createElement('span');
    size.textContent = formatBytes(item.source.size);
    const select = document.createElement('select');
    select.dataset.action = 'format';
    select.setAttribute('aria-label', `${t('outputFormat')}: ${item.source.name}`);
    select.disabled = busy;
    select.replaceChildren(...availableFormats(item.source.type).map(([value, label]) => new Option(label, value)));
    select.value = item.outputType;
    details.append(size, select);
    const status = document.createElement('p');
    status.className = `batch-item-status${item.error ? ' batch-error' : ''}`;
    status.textContent = item.error || (item.result ? batchResultText(item.result) : t(item.status));
    row.append(head, details, status);
    if (item.result) {
      const download = document.createElement('button');
      download.type = 'button';
      download.className = 'secondary-button batch-download';
      download.dataset.action = 'download';
      download.disabled = item.downloadBlocked;
      download.textContent = t(item.downloadBlocked ? 'batchDownloadStarted' : item.downloaded ? 'downloadAgain' : 'batchDownload');
      row.append(download);
    }
    return row;
  }));
}

function batchResultText({ blob, source, keepOriginal, isPdf }) {
  const change = Math.round((blob.size / source.size - 1) * 100);
  const difference = change < 0 ? `−${Math.abs(change)} %` : change > 0 ? `+${change} %` : '0 %';
  const warning = source.type.includes('officedocument') ? t('officeResultWarning')
    : isPdf && blob.type === 'text/plain' ? t('pdfTextResult')
      : isPdf && !keepOriginal && blob.type === 'application/pdf' ? t('pdfResultWarning') : '';
  return `${t('batchDone')} · ${formatBytes(source.size)} → ${formatBytes(blob.size)} (${difference})${warning}`;
}

function outputFilename(current) {
  return current.filename ?? `${current.source.name.replace(/\.[^.]+$/, '')}${t(current.sameFormat ? 'fileSuffix' : 'convertedSuffix')}.${extensions[current.blob.type]}`;
}

function downloadResult(current) {
  const url = URL.createObjectURL(current.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = outputFilename(current);
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function changed() {
  stopOperation();
  clearResult();
  if (items.length === 1) {
    items[0].outputType = format.value;
    items[0].result = null;
    $('batch-quality').value = quality.value;
  }
  $('error').hidden = true;
  scheduleEstimate();
}

$('dropzone').addEventListener('click', () => $('file-input').click());
$('dropzone').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $('file-input').click(); }
});
$('file-input').addEventListener('change', (event) => {
  selectFiles([...event.target.files]);
  event.target.value = '';
});
for (const name of ['dragenter', 'dragover', 'dragleave', 'drop']) {
  $('dropzone').addEventListener(name, (event) => {
    event.preventDefault();
    $('dropzone').classList.toggle('dragging', name === 'dragenter' || name === 'dragover');
    if (name === 'drop') selectFiles([...event.dataTransfer.files]);
  });
}
$('remove-file').addEventListener('click', () => {
  selectionVersion += 1;
  stopOperation();
  stopEstimate();
  clearResult();
  items.length = 0;
  mergedPdf = null;
  file = null;
  imageCache = null;
  estimateData = null;
  $('workspace').hidden = true;
  $('error').hidden = true;
  $('app').classList.remove('has-file');
  render();
  $('dropzone').focus();
});
$('batch-list').addEventListener('change', (event) => {
  if (event.target.dataset.action !== 'format') return;
  const item = items.find((entry) => entry.id === Number(event.target.closest('.batch-item').dataset.id));
  if (!item || operation) return;
  item.outputType = event.target.value;
  item.result = null;
  item.error = '';
  item.status = 'batchReady';
  item.downloaded = false;
  item.downloadBlocked = false;
  renderBatch();
});
$('batch-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const item = items.find((entry) => entry.id === Number(button.closest('.batch-item').dataset.id));
  if (!item || operation) return;
  if (button.dataset.action === 'download') {
    if (!item.result || item.downloadBlocked) return;
    downloadResult(item.result);
    item.downloaded = true;
    item.downloadBlocked = true;
    renderBatch();
    $('batch-list').querySelector(`[data-id="${item.id}"] [data-action="download"]`)?.focus({ preventScroll: true });
    const current = item.result;
    setTimeout(() => {
      if (item.result !== current) return;
      item.downloadBlocked = false;
      renderBatch();
    }, 2000);
  } else if (button.dataset.action === 'remove') {
    items.splice(items.indexOf(item), 1);
    mergedPdf = null;
    clearResult();
    stopEstimate();
    showItems();
    render();
    if (!items.length) $('dropzone').focus();
  }
});
$('batch-quality').addEventListener('input', () => {
  mergedPdf = null;
  for (const item of items) { item.result = null; item.error = ''; item.status = 'batchReady'; item.downloaded = false; item.downloadBlocked = false; }
  renderBatch();
});
$('batch-zip').addEventListener('click', async () => {
  if (operation) return;
  const ready = items.filter((item) => item.result);
  if (!ready.length) return showError(t('zipNoResults'));
  const controller = new AbortController();
  operation = controller;
  $('batch-progress').hidden = false;
  $('batch-progress').textContent = t('processingLocal');
  renderBatch();
  try {
    const names = new Map();
    const entries = ready.map((item) => {
      const name = outputFilename(item.result);
      const count = (names.get(name) || 0) + 1;
      names.set(name, count);
      return { name: count === 1 ? name : name.replace(/(\.[^.]+)$/, `-${count}$1`), blob: item.result.blob };
    });
    const blob = await zipBlobs(entries, controller.signal);
    downloadResult({ blob, filename: 'localvert-results.zip' });
    $('batch-progress').textContent = ready.length === items.length ? t('zipStarted') : t('zipPartial', { count: ready.length, total: items.length });
  } catch (error) { if (!controller.signal.aborted) showError(error instanceof Error ? error.message : t('processingError')); }
  finally { operation = null; renderBatch(); }
});
$('batch-cancel').addEventListener('click', () => operation?.abort());
$('merge-pdf').addEventListener('click', async () => {
  if (operation || items.length < 2 || !items.every((item) => item.source.type.startsWith('image/'))) return;
  const controller = new AbortController();
  operation = controller;
  mergedPdf = null;
  $('batch-progress').hidden = false;
  renderBatch();
  try {
    const blob = await imagesToPdf(items.map((item) => item.source), Number($('batch-quality').value), controller.signal, (key, values) => {
      $('batch-progress').textContent = t(key, values);
    });
    mergedPdf = { blob, filename: t('mergedPdfName') };
  } catch (error) {
    if (!controller.signal.aborted) showError(error instanceof Error ? error.message : t('processingError'));
  } finally {
    operation = null;
    $('batch-progress').hidden = true;
    renderBatch();
    if (mergedPdf) $('merge-download').focus({ preventScroll: true });
  }
});
$('merge-download').addEventListener('click', () => {
  if (!mergedPdf || mergedPdf.downloadBlocked) return;
  const current = mergedPdf;
  downloadResult(current);
  current.downloaded = true;
  current.downloadBlocked = true;
  renderBatch();
  setTimeout(() => {
    if (mergedPdf !== current) return;
    current.downloadBlocked = false;
    renderBatch();
  }, 2000);
});
quality.addEventListener('input', changed);
format.addEventListener('change', changed);
for (const id of ['max-dimension', 'rotation', 'square-crop']) $(id).addEventListener('change', changed);
target.addEventListener('input', () => { clearResult(); if (items.length === 1) items[0].result = null; $('error').hidden = true; scheduleEstimate(); });
$('cancel').addEventListener('click', changed);

async function convert(source, outputType, strength, targetBytes, cached, signal, updateProgress, options = {}) {
  const value = 100 - strength;
  const transformed = !!(options.maxDimension || options.rotation || options.squareCrop);
  const image = source.type.startsWith('image/') && outputType.startsWith('image/')
    ? cached ?? (targetBytes && source.type === outputType && source.size <= targetBytes && !transformed ? { blob: source, targetMet: true }
      : targetBytes ? await compressImageToTarget(source, outputType, targetBytes, signal, options) : await compressImage(source, outputType, value, signal, options)) : null;
  const conversion = image ?? (source.type === 'application/pdf' && outputType.includes('localvert-')
    ? { blob: await pdfToImagesZip(source, outputType.includes('png-pages') ? 'image/png' : 'image/jpeg', strength, signal, updateProgress) }
    : source.type === 'application/pdf' && outputType === 'application/pdf'
    ? await compressPdf(source, value, targetBytes, signal, updateProgress)
    : { blob: source.type === 'application/pdf' ? await pdfToText(source, signal, updateProgress)
      : source.type.startsWith('image/') ? await imageToPdf(source, strength, signal)
        : source.type.startsWith('audio/') || source.type.startsWith('video/') ? await convertMedia(source, outputType, strength, signal, updateProgress)
          : outputType === 'application/pdf' ? await officeToPdf(source, signal)
            : outputType === 'text/csv' ? await xlsxToCsv(source, signal)
              : source.type.includes('presentationml') ? await pptxToText(source, signal) : await docxToText(source, signal) });
  signal.throwIfAborted();
  const sameFormat = source.type === outputType;
  const keepOriginal = sameFormat && !transformed && conversion.blob.size >= source.size;
  return { blob: keepOriginal ? source : conversion.blob, source, sameFormat, keepOriginal, targetBytes, isPdf: source.type === 'application/pdf', reducedFurther: conversion.reducedFurther, reason: conversion.reason, image };
}

$('batch-process').addEventListener('click', async () => {
  if (items.length < 2 || operation) return;
  const controller = new AbortController();
  operation = controller;
  $('error').hidden = true;
  $('batch-progress').hidden = false;
  renderBatch();
  const pending = [...items];
  for (const [index, item] of pending.entries()) {
    if (controller.signal.aborted) break;
    item.result = null;
    item.error = '';
    item.downloaded = false;
    item.downloadBlocked = false;
    item.status = 'batchWorking';
    $('batch-progress').textContent = t('batchProgress', { current: index + 1, total: pending.length, name: item.source.name });
    renderBatch();
    try {
      item.result = await convert(item.source, item.outputType, Number($('batch-quality').value), null, null, controller.signal, (key, values) => {
        $('batch-progress').textContent = `${t('batchProgress', { current: index + 1, total: pending.length, name: item.source.name })} · ${t(key, values)}`;
      });
      item.status = 'batchDone';
    } catch (error) {
      if (controller.signal.aborted) { item.status = 'batchReady'; break; }
      item.error = `${t('batchFailed')}: ${error instanceof Error ? error.message : t('processingError')}`;
    }
    renderBatch();
  }
  if (operation === controller) operation = null;
  $('batch-progress').hidden = true;
  renderBatch();
  $('batch-list').querySelector('[data-action="download"]')?.focus({ preventScroll: true });
});

$('process').addEventListener('click', async () => {
  if (!file || operation) return;
  const source = file;
  const config = settings();
  let targetBytes;
  let options = {};
  try {
    targetBytes = targetBytesFor(source, config.outputType);
    if (source.type.startsWith('image/') && config.outputType.startsWith('image/')) options = imageOptions();
  } catch (error) { return showError(error.message); }
  const cached = imageCache;
  stopEstimate();
  clearResult();
  $('error').hidden = true;
  const controller = new AbortController();
  operation = controller;
  const updateProgress = (key, values) => {
    if (controller.signal.aborted) return;
    progressMessage = { key, values };
    $('progress').textContent = t(key, values);
  };
  setBusy(true);
  updateProgress('processingLocal');
  try {
    result = await convert(source, config.outputType, config.strength, targetBytes, targetBytes ? null : cached, controller.signal, updateProgress, options);
    const { image, keepOriginal } = result;
    if (image) { imageCache = image; renderSettings(); }
    renderResult();
    $('download').focus({ preventScroll: true });
    try {
      if ((config.outputType === 'application/pdf' || config.outputType.startsWith('image/')) && (config.isPdf || source.type.startsWith('image/'))) {
        const original = config.isPdf ? await pdfPreview(source, controller.signal) : source;
        controller.signal.throwIfAborted();
        const converted = keepOriginal ? original : config.outputType === 'application/pdf' ? await pdfPreview(result.blob, controller.signal) : result.blob;
        controller.signal.throwIfAborted();
        for (const [id, blob] of [['original-preview', original], ['result-preview', converted]]) {
          const url = URL.createObjectURL(blob);
          previewUrls.push(url);
          $(id).src = url;
        }
        $('preview').hidden = false;
      }
    } catch (error) {
      if (!controller.signal.aborted) $('preview-error').hidden = false;
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      showError(error instanceof Error ? error.message : t('processingError'));
      estimateData = { key: 'noEstimate' };
      renderEstimate();
    }
  } finally {
    if (operation === controller) { operation = null; setBusy(false); }
  }
});

$('download').addEventListener('click', () => {
  if (!result || $('download').disabled) return;
  const current = result;
  downloadResult(result);
  downloadStarted = true;
  $('download').disabled = true;
  $('download-status').hidden = false;
  renderResult();
  downloadTimer = setTimeout(() => {
    if (result !== current) return;
    $('download').disabled = false;
    renderResult();
  }, 2000);
});

const extensionApi = globalThis.browser ?? globalThis.chrome;
extensionApi?.runtime?.onMessage?.addListener((message) => {
  if (message?.type === 'localVertSourceTab' && Number.isInteger(message.tabId)) {
    uploadTabId = message.tabId;
    if (result) renderResult();
  }
});

$('upload-field').addEventListener('click', async () => {
  if (!result || !uploadTabId) return;
  const status = $('upload-status');
  status.hidden = false;
  if (result.blob.size > 2 * 1024 ** 2) { status.textContent = t('uploadTooLarge'); return; }
  const api = globalThis.browser ?? globalThis.chrome;
  if (!api?.scripting?.executeScript) { status.textContent = t('uploadUnavailable'); return; }
  $('upload-field').disabled = true;
  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(result.blob);
    });
    const filename = outputFilename(result);
    const [{ result: filled }] = await api.scripting.executeScript({
      target: { tabId: uploadTabId },
      func: fillUploadField,
      args: [base64, filename, result.blob.type],
    });
    status.textContent = t(filled ? 'uploadDone' : 'uploadNoField');
    if (filled) {
      try { await api.tabs.update(uploadTabId, { active: true }); }
      catch { /* The file was inserted; switching tabs is only a convenience. */ }
    }
  } catch { status.textContent = t('uploadFailed'); }
  finally { $('upload-field').disabled = false; }
});

initPreferences(render, showError);
render();
