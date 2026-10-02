import { locale, t } from './i18n.js';
import { initPreferences } from './preferences.js';
import { compressImage, compressPdf, estimatePdf, pdfPreview, validateFile, MAX_ESTIMATE_SIZE } from './conversion.js';
import { audioToWav, imageToPdf, pdfToText } from './extra-conversion.js';
import { docxToText, xlsxToCsv } from './office-conversion.js';

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
const items = [];
let nextItemId = 0;
const MAX_BATCH_FILES = 20;
const previewUrls = [];
const formats = {
  'image/jpeg': [['image/jpeg', 'JPEG'], ['image/png', 'PNG'], ['image/webp', 'WebP'], ['application/pdf', 'PDF']],
  'image/png': [['image/png', 'PNG'], ['image/jpeg', 'JPEG'], ['image/webp', 'WebP'], ['application/pdf', 'PDF']],
  'image/webp': [['image/webp', 'WebP'], ['image/jpeg', 'JPEG'], ['image/png', 'PNG'], ['application/pdf', 'PDF']],
  'application/pdf': [['application/pdf', 'PDF'], ['text/plain', 'TXT']],
  'audio/mpeg': [['audio/wav', 'WAV']],
  'audio/wav': [['audio/wav', 'WAV']],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [['text/plain', 'TXT']],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [['text/csv', 'CSV']],
};
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf', 'text/plain': 'txt', 'text/csv': 'csv', 'audio/wav': 'wav' };

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

function setFormats(type) {
  const options = formats[type];
  format.replaceChildren(...options.map(([value, label]) => new Option(label, value)));
  format.value = options.some(([value]) => value === type) ? type : options[0][0];
}

function stopEstimate() {
  clearTimeout(estimateTimer);
  estimation?.abort();
  estimation = null;
}

function setBusy(busy) {
  for (const control of [quality, format, target, $('process')]) control.disabled = busy;
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
}

function renderSettings() {
  if (!file) return;
  const { strength, isPdf, outputType } = settings();
  const isAudio = file.type.startsWith('audio/');
  const isOffice = file.type.includes('officedocument');
  const isPdfText = isPdf && outputType === 'text/plain';
  const hasQuality = !isPdfText && !isOffice;
  $('quality-row').hidden = !hasQuality;
  $('format-row').hidden = false;
  $('target-row').hidden = !isPdf || isPdfText || strength <= 30;
  $('pdf-notice').hidden = !isPdf && !isOffice;
  $('pdf-notice').textContent = isOffice ? t(outputType === 'text/csv' ? 'xlsxNotice' : 'docxNotice')
    : isPdfText ? t('pdfTextNotice') : t(strength <= 30 ? 'pdfOriginalNotice' : 'pdfRasterNotice');
  $('file-name').textContent = file.name;
  $('file-name').title = file.name;
  $('file-size').textContent = formatBytes(file.size);
  $('file-kind').textContent = isOffice ? (outputType === 'text/csv' ? 'XLSX' : 'DOCX')
    : file.type === 'audio/mpeg' ? 'MP3' : file.type === 'audio/wav' ? 'WAV' : isPdf ? 'PDF' : file.type.split('/')[1].toUpperCase().replace('JPEG', 'JPG');
  if (!hasQuality) { $('quality-warning').hidden = true; return; }
  const level = strength > 65 ? 'low' : strength > 30 ? 'medium' : 'good';
  $('workspace').dataset.quality = level;
  $('quality-output').textContent = t(strength <= 30 ? 'gentle' : strength <= 65 ? 'balanced' : 'strong');
  quality.setAttribute('aria-valuetext', $('quality-output').textContent);
  const unchangedPng = outputType === 'image/png' && imageCache && imageCache.sourceWidth === imageCache.width && imageCache.sourceHeight === imageCache.height;
  $('quality-status').className = `quality-status quality-${unchangedPng ? 'good' : level}`;
  $('quality-status').textContent = t(isAudio ? 'audioQualityNotice' : unchangedPng ? 'resolutionUnchanged' : isPdf && strength <= 30 ? 'qualityUnchanged'
    : outputType === 'image/png' ? (strength > 65 ? 'detailsMuchLower' : strength > 30 ? 'detailsReduced' : 'qualityHigh')
      : strength > 65 ? 'qualityMuchLower' : strength > 30 ? 'qualityReduced' : 'qualityHigh');
  $('quality-warning').hidden = strength <= 65 || unchangedPng;
  $('quality-warning').textContent = t(isAudio ? 'audioWarning' : isPdf ? 'pdfWarning' : outputType === 'image/png' ? 'pngWarning' : 'imageWarning');
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
  const targetNote = targetBytes && blob.size > targetBytes ? t('targetMissed') : '';
  $('result-stats').textContent = !sameFormat
    ? t('convertedResult', { result: formatBytes(blob.size), original: formatBytes(source.size), target: targetNote })
    : saved > 0
      ? t('savedResult', { result: formatBytes(blob.size), original: formatBytes(source.size), percent: Math.round(saved / source.size * 100), target: targetNote })
      : t('noSmallerResult', { onePixel: image?.sourceWidth === 1 && image?.sourceHeight === 1 ? t('onePixelResult') : '', target: targetNote });
  if (isPdf && !keepOriginal && result.blob.type === 'application/pdf') $('result-stats').textContent += t('pdfResultWarning');
  if (isPdf && result.blob.type === 'text/plain') $('result-stats').textContent += t('pdfTextResult');
  if (source.type.includes('officedocument')) $('result-stats').textContent += t('officeResultWarning');
  if (reducedFurther && !keepOriginal) $('result-stats').textContent += t('targetAdjusted');
  $('result-size').textContent = formatBytes(blob.size);
  $('download').textContent = t($('download').disabled ? 'downloadStarted' : downloadStarted ? 'downloadAgain' : 'download');
  $('download-status').textContent = t('downloadStatus');
  $('process').hidden = true;
  $('download').hidden = false;
  $('result-panel').hidden = false;
  $('app').classList.add('has-result');
  $('estimate').hidden = true;
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
  const key = !estimable ? 'noEstimate' : config.isPdf && config.value >= 70 ? 'original'
    : source.size > MAX_ESTIMATE_SIZE ? (config.isPdf ? 'largePdfEstimate' : 'largeImageEstimate') : 'calculating';
  estimateData = { key };
  render();
  if (key !== 'calculating') return;
  const controller = new AbortController();
  estimation = controller;
  estimateTimer = setTimeout(async () => {
    try {
      const data = config.isPdf ? await estimatePdf(source, config.value, controller.signal)
        : await compressImage(source, config.outputType, config.value, controller.signal);
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
      accepted.push({ id: ++nextItemId, source, outputType: source.type === 'audio/mpeg' ? 'audio/wav' : source.type.includes('officedocument') ? formats[source.type][0][0] : source.type, result: null, error: '', status: 'batchReady', downloaded: false });
    } catch (error) { errors.push(`${candidate.name}: ${error.message}`); }
  }
  if (version !== selectionVersion) return;
  if (errors.length) showError(errors.join(' · '));
  else $('error').hidden = true;
  if (!accepted.length) return;
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
  $('batch-cancel').hidden = !busy;
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
    select.replaceChildren(...formats[item.source.type].map(([value, label]) => new Option(label, value)));
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

function downloadResult(current) {
  const url = URL.createObjectURL(current.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${current.source.name.replace(/\.[^.]+$/, '')}${t(current.sameFormat ? 'fileSuffix' : 'convertedSuffix')}.${extensions[current.blob.type]}`;
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
    clearResult();
    stopEstimate();
    showItems();
    render();
    if (!items.length) $('dropzone').focus();
  }
});
$('batch-quality').addEventListener('input', () => {
  for (const item of items) { item.result = null; item.error = ''; item.status = 'batchReady'; item.downloaded = false; item.downloadBlocked = false; }
  renderBatch();
});
$('batch-cancel').addEventListener('click', () => operation?.abort());
quality.addEventListener('input', changed);
format.addEventListener('change', changed);
target.addEventListener('input', () => { clearResult(); if (items.length === 1) items[0].result = null; $('error').hidden = true; renderEstimate(); });
$('cancel').addEventListener('click', changed);

async function convert(source, outputType, strength, targetBytes, cached, signal, updateProgress) {
  const value = 100 - strength;
  const image = source.type.startsWith('image/') && outputType.startsWith('image/')
    ? cached ?? await compressImage(source, outputType, value, signal) : null;
  const conversion = image ?? (source.type === 'application/pdf' && outputType === 'application/pdf'
    ? await compressPdf(source, value, targetBytes, signal, updateProgress)
    : { blob: source.type === 'application/pdf' ? await pdfToText(source, signal, updateProgress)
      : source.type.startsWith('image/') ? await imageToPdf(source, strength, signal)
        : source.type.startsWith('audio/') ? await audioToWav(source, strength, signal)
          : outputType === 'text/csv' ? await xlsxToCsv(source, signal) : await docxToText(source, signal) });
  signal.throwIfAborted();
  const sameFormat = source.type === outputType;
  const keepOriginal = sameFormat && conversion.blob.size >= source.size;
  return { blob: keepOriginal ? source : conversion.blob, source, sameFormat, keepOriginal, targetBytes, isPdf: source.type === 'application/pdf', reducedFurther: conversion.reducedFurther, image };
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
  const targetText = config.isPdf && config.outputType === 'application/pdf' && config.value < 70 ? target.value.trim() : '';
  const targetBytes = targetText ? Number(targetText.replace(',', '.')) * 1024 ** 2 : null;
  if (targetText && (!Number.isFinite(targetBytes) || targetBytes <= 0)) return showError(t('invalidTarget'));
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
    result = await convert(source, config.outputType, config.strength, targetBytes, cached, controller.signal, updateProgress);
    const { image, keepOriginal } = result;
    if (image) { imageCache = image; renderSettings(); }
    renderResult();
    $('download').focus({ preventScroll: true });
    try {
      if (config.outputType === 'application/pdf' || config.outputType.startsWith('image/')) {
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

initPreferences(render, showError);
render();
