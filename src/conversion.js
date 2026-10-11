import * as pdfjs from '../vendor/pdfjs/pdf.mjs';
import { t } from './i18n.js';
import { officeEntries } from './office-conversion.js';
import { UTIF } from '../vendor/generated/tiff-vendor.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;

export const MAX_FILE_SIZE = 100 * 1024 ** 2;
export const MAX_ESTIMATE_SIZE = 30 * 1024 ** 2;

export async function validateFile(file) {
  if (!file.size) throw new Error(t('emptyFile'));
  if (file.size > MAX_FILE_SIZE) throw new Error(t('fileTooLarge'));
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const starts = (...signature) => signature.every((byte, index) => bytes[index] === byte);
  const text = new TextDecoder('latin1').decode(bytes);
  const type = starts(0xff, 0xd8, 0xff) ? 'image/jpeg'
    : starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a) ? 'image/png'
      : text.startsWith('RIFF') && text.slice(8, 12) === 'WEBP' ? 'image/webp'
        : text.startsWith('GIF87a') || text.startsWith('GIF89a') ? 'image/gif'
          : starts(0x49, 0x49, 0x2a, 0x00) || starts(0x4d, 0x4d, 0x00, 0x2a) ? 'image/tiff'
            : text.slice(4, 12).includes('ftypavif') || text.slice(4, 12).includes('ftypavis') ? 'image/avif'
              : /^ftyp(heic|heix|hevc|hevx|mif1)/.test(text.slice(4, 12)) ? 'image/heic'
        : text.startsWith('%PDF-') ? 'application/pdf'
          : text.slice(4, 8) === 'ftyp' ? 'video/mp4'
            : starts(0x1a, 0x45, 0xdf, 0xa3) ? 'video/webm'
              : text.startsWith('fLaC') ? 'audio/flac'
                : text.startsWith('OggS') ? 'audio/ogg'
          : text.startsWith('RIFF') && text.slice(8, 12) === 'WAVE' ? 'audio/wav'
            : text.startsWith('ID3') || (starts(0xff) && (bytes[1] & 0xe0) === 0xe0) ? 'audio/mpeg'
              : starts(0x50, 0x4b, 0x03, 0x04) ? 'office/zip' : null;
  if (!type) throw new Error(t('unsupported'));
  if (type === 'office/zip') {
    const archive = await officeEntries(file);
    const documentType = archive.has('word/document.xml') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : archive.has('xl/workbook.xml') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : archive.has('ppt/presentation.xml') ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : null;
    if (!documentType) throw new Error(t('unsupported'));
    return new File([file], file.name, { type: documentType, lastModified: file.lastModified });
  }
  // Browsers may supply an empty or incorrect MIME type for local files.
  return file.type === type ? file : new File([file], file.name, { type, lastModified: file.lastModified });
}

export async function imageBitmap(file) {
  if (file.type !== 'image/tiff') {
    try { return await createImageBitmap(file); }
    catch { throw new Error(t(file.type === 'image/heic' ? 'heicUnavailable' : 'imageReadError')); }
  }
  try {
    const bytes = await file.arrayBuffer();
    const pages = UTIF.decode(bytes);
    if (!pages.length) throw new Error();
    if ((pages[0].t256?.[0] ?? 0) * (pages[0].t257?.[0] ?? 0) > 20_000_000) throw new Error();
    UTIF.decodeImage(bytes, pages[0]);
    const pixels = UTIF.toRGBA8(pages[0]);
    if (pages[0].width * pages[0].height > 20_000_000) throw new Error();
    const canvas = document.createElement('canvas');
    canvas.width = pages[0].width;
    canvas.height = pages[0].height;
    canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels), canvas.width, canvas.height), 0, 0);
    const bitmap = await createImageBitmap(canvas);
    canvas.width = canvas.height = 0;
    return bitmap;
  } catch { throw new Error(t('imageReadError')); }
}

function encodeCanvas(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (blob?.type === type) resolve(blob);
    else reject(new Error(t('imageEncodeError')));
  }, type, quality));
}

export async function compressImage(file, outputType, value, signal, options = {}) {
  signal.throwIfAborted();
  const bitmap = await imageBitmap(file);
  const canvas = document.createElement('canvas');
  try {
    signal.throwIfAborted();
    const sourceWidth = bitmap.width;
    const sourceHeight = bitmap.height;
    const maxDimension = Math.min(options.maxDimension || Infinity, value < 35 ? 1800 : value < 70 ? 2400 : 3200);
    const strength = 100 - value;
    const pngScale = outputType === 'image/png' && strength > 30 ? 1 - .5 * (strength - 30) / 60 : 1;
    const side = Math.min(sourceWidth, sourceHeight);
    const crop = options.squareCrop ? { x: Math.floor((sourceWidth - side) / 2), y: Math.floor((sourceHeight - side) / 2), width: side, height: side }
      : options.crop || { x: 0, y: 0, width: sourceWidth, height: sourceHeight };
    if (![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) || crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0 || crop.x + crop.width > sourceWidth || crop.y + crop.height > sourceHeight) throw new Error(t('invalidCrop'));
    const rotation = options.rotation || 0;
    if (![0, 90, 180, 270].includes(rotation)) throw new Error(t('invalidCrop'));
    const rotated = rotation === 90 || rotation === 270;
    const baseWidth = rotated ? crop.height : crop.width;
    const baseHeight = rotated ? crop.width : crop.height;
    const scale = Math.min(1, maxDimension / Math.max(baseWidth, baseHeight), Math.sqrt(20_000_000 / (baseWidth * baseHeight))) * pngScale;
    canvas.width = Math.max(1, Math.round(baseWidth * scale));
    canvas.height = Math.max(1, Math.round(baseHeight * scale));
    const context = canvas.getContext('2d', { alpha: outputType !== 'image/jpeg' });
    if (!context) throw new Error(t('canvasMemory'));
    if (outputType === 'image/jpeg') {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(rotation * Math.PI / 180);
    context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height,
      -(rotated ? canvas.height : canvas.width) / 2, -(rotated ? canvas.width : canvas.height) / 2,
      rotated ? canvas.height : canvas.width, rotated ? canvas.width : canvas.height);
    const blob = await encodeCanvas(canvas, outputType, Math.max(.1, Math.min(1, value / 100)));
    signal.throwIfAborted();
    return { blob, sourceWidth, sourceHeight, width: canvas.width, height: canvas.height };
  } finally {
    bitmap.close();
    canvas.width = canvas.height = 0;
  }
}

export async function compressImageToTarget(file, outputType, targetBytes, signal, options = {}) {
  const attempts = [80, 65, 50, 35, 20, 10];
  let best;
  for (const value of attempts) {
    signal.throwIfAborted();
    const candidate = await compressImage(file, outputType, value, signal, options);
    if (!best || candidate.blob.size < best.blob.size) best = candidate;
    if (candidate.blob.size <= targetBytes) return { ...candidate, targetMet: true };
  }
  return { ...best, targetMet: false };
}

async function withPdf(file, signal, run) {
  signal.throwIfAborted();
  const data = new Uint8Array(await file.arrayBuffer());
  signal.throwIfAborted();
  const task = pdfjs.getDocument({
    data,
    cMapUrl: new URL('../vendor/pdfjs/cmaps/', import.meta.url).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('../vendor/pdfjs/standard_fonts/', import.meta.url).href,
    wasmUrl: new URL('../vendor/pdfjs/wasm/', import.meta.url).href,
    iccUrl: new URL('../vendor/pdfjs/iccs/', import.meta.url).href,
    stopAtErrors: true,
    isEvalSupported: false,
  });
  let cleanup;
  const destroy = () => (cleanup ??= task.destroy());
  const abort = () => { destroy().catch(() => {}); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    let pdf;
    try { pdf = await task.promise; }
    catch (error) {
      signal.throwIfAborted();
      throw new Error(t(error?.name === 'PasswordException' ? 'pdfPassword' : 'pdfReadError'));
    }
    signal.throwIfAborted();
    if (pdf.numPages > 200) throw new Error(t('tooManyPages'));
    return await run(pdf);
  } finally {
    signal.removeEventListener('abort', abort);
    await destroy();
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

async function rasterizePdf(source, profile, signal, onProgress = () => {}, pageCount = source.numPages) {
  const output = await globalThis.PDFLib.PDFDocument.create();
  for (let number = 1; number <= pageCount; number += 1) {
    signal.throwIfAborted();
    const page = await source.getPage(number);
    const canvas = document.createElement('canvas');
    try {
      const size = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(profile.scale, Math.sqrt(6_000_000 / (size.width * size.height))) });
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error(t('canvasMemory'));
      await page.render({ canvas, canvasContext: context, viewport, background: 'white' }).promise;
      signal.throwIfAborted();
      const jpeg = await encodeCanvas(canvas, 'image/jpeg', profile.quality);
      signal.throwIfAborted();
      const embedded = await output.embedJpg(await jpeg.arrayBuffer());
      output.addPage([size.width, size.height]).drawImage(embedded, { x: 0, y: 0, width: size.width, height: size.height });
      onProgress('pageProgress', { page: number, total: pageCount });
      await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
      canvas.width = canvas.height = 0;
      page.cleanup();
    }
  }
  signal.throwIfAborted();
  const bytes = await output.save({ useObjectStreams: true });
  signal.throwIfAborted();
  return new Blob([bytes], { type: 'application/pdf' });
}

export function estimatePdf(file, value, signal) {
  return withPdf(file, signal, async (pdf) => {
    if (value >= 70) {
      const optimized = await optimizePdfStructure(file, signal);
      return { size: optimized.blob.size, pages: pdf.numPages, structural: true };
    }
    const sample = await rasterizePdf(pdf, profiles(value)[0], signal, undefined, 1);
    return { size: sample.size * pdf.numPages, pages: pdf.numPages };
  });
}

export async function optimizePdfStructure(file, signal) {
  signal.throwIfAborted();
  if (file.size > MAX_ESTIMATE_SIZE) return { blob: file, reason: 'pdfLargeKept' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  signal.throwIfAborted();
  // Rewriting signed or interactive PDFs can invalidate important features.
  const decoder = new TextDecoder('latin1');
  let tail = '';
  for (let offset = 0; offset < bytes.length; offset += 1024 ** 2) {
    signal.throwIfAborted();
    const chunk = tail + decoder.decode(bytes.subarray(offset, offset + 1024 ** 2));
    if (/\/(?:ByteRange|Sig|AcroForm|XFA|Encrypt|Annots|Outlines|EmbeddedFiles|OCProperties|StructTreeRoot)\b/.test(chunk)) return { blob: file, reason: 'pdfComplexKept' };
    tail = chunk.slice(-64);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  try {
    const document = await PDFLib.PDFDocument.load(bytes, { updateMetadata: false });
    const pageCount = document.getPageCount();
    const saved = await document.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
    signal.throwIfAborted();
    if (saved.length >= file.size) return { blob: file, reason: 'pdfNoStructuralSaving' };
    const check = await PDFLib.PDFDocument.load(saved, { updateMetadata: false });
    if (check.getPageCount() !== pageCount) return { blob: file, reason: 'pdfComplexKept' };
    return { blob: new Blob([saved], { type: 'application/pdf' }), structural: true };
  } catch {
    signal.throwIfAborted();
    return { blob: file, reason: 'pdfComplexKept' };
  }
}

export function compressPdf(file, value, targetBytes, signal, onProgress) {
  return withPdf(file, signal, async (pdf) => {
    if (value >= 70) return { ...await optimizePdfStructure(file, signal), reducedFurther: false };
    const variants = profiles(value);
    let best;
    for (let index = 0; index < (targetBytes ? variants.length : 1); index += 1) {
      onProgress('variantProgress', { index: index + 1, total: targetBytes ? variants.length : 1 });
      const blob = await rasterizePdf(pdf, variants[index], signal, onProgress);
      if (!best || blob.size < best.blob.size) best = { blob, reducedFurther: index > 0 };
      if (targetBytes && blob.size <= targetBytes) break;
    }
    return best;
  });
}

export function pdfPreview(file, signal) {
  return withPdf(file, signal, async (pdf) => {
    const page = await pdf.getPage(1);
    const canvas = document.createElement('canvas');
    try {
      const size = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(1, 700 / size.width, 700 / size.height) });
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error(t('canvasMemory'));
      await page.render({ canvas, canvasContext: context, viewport, background: 'white' }).promise;
      signal.throwIfAborted();
      return await encodeCanvas(canvas, 'image/png');
    } finally {
      canvas.width = canvas.height = 0;
      page.cleanup();
    }
  });
}
