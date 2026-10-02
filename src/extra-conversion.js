import * as pdfjs from '../vendor/pdfjs/pdf.mjs';
import { t } from './i18n.js';

// These routes intentionally use only browser APIs and the PDF library already
// shipped with the extension. No input is sent to a service.
export async function imageToPdf(file, strength, signal) {
  signal.throwIfAborted();
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  try {
    const limit = strength > 65 ? 1800 : strength > 30 ? 2400 : 3200;
    const scale = Math.min(1, limit / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error(t('canvasMemory'));
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const jpeg = await new Promise((resolve, reject) => canvas.toBlob((blob) => blob?.type === 'image/jpeg' ? resolve(blob) : reject(new Error(t('imageEncodeError'))), 'image/jpeg', (100 - strength) / 100));
    signal.throwIfAborted();
    const output = await PDFLib.PDFDocument.create();
    const embedded = await output.embedJpg(await jpeg.arrayBuffer());
    output.addPage([canvas.width, canvas.height]).drawImage(embedded, { x: 0, y: 0, width: canvas.width, height: canvas.height });
    const bytes = await output.save();
    signal.throwIfAborted();
    return new Blob([bytes], { type: 'application/pdf' });
  } finally {
    bitmap.close();
    canvas.width = canvas.height = 0;
  }
}

export async function pdfToText(file, signal, onProgress = () => {}) {
  signal.throwIfAborted();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false });
  const abort = () => { task.destroy().catch(() => {}); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 200) throw Object.assign(new Error(t('tooManyPages')), { code: 'tooManyPages' });
    const pages = [];
    for (let index = 1; index <= pdf.numPages; index++) {
      signal.throwIfAborted();
      const page = await pdf.getPage(index);
      try {
        const content = await page.getTextContent();
        let text = '';
        for (const item of content.items) {
          if ('str' in item) text += item.str + (item.hasEOL ? '\n' : ' ');
        }
        pages.push(text.trim());
      } finally { page.cleanup(); }
      onProgress('pageProgress', { page: index, total: pdf.numPages });
    }
    signal.throwIfAborted();
    if (!pages.some(Boolean)) throw Object.assign(new Error(t('pdfNoText')), { code: 'pdfNoText' });
    return new Blob([pages.join('\n\n---\n\n') + '\n'], { type: 'text/plain' });
  } catch (error) {
    signal.throwIfAborted();
    if (error?.name === 'PasswordException') throw new Error(t('pdfPassword'));
    if (error?.code === 'pdfNoText' || error?.code === 'tooManyPages') throw error;
    throw new Error(t('pdfReadError'));
  } finally {
    signal.removeEventListener('abort', abort);
    await task.destroy();
  }
}

export async function audioToWav(file, strength, signal) {
  signal.throwIfAborted();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !window.OfflineAudioContext) throw new Error(t('audioDecodeError'));
  const context = new AudioContextClass();
  try {
    const decoded = await context.decodeAudioData(await file.arrayBuffer());
    signal.throwIfAborted();
    const sampleRate = strength > 65 ? 22050 : strength > 30 ? 32000 : 44100;
    const channels = strength > 65 ? 1 : Math.min(2, decoded.numberOfChannels);
    const length = Math.ceil(decoded.duration * sampleRate);
    if (length * channels * 2 > 150 * 1024 ** 2) throw new Error(t('audioTooLong'));
    const offline = new OfflineAudioContext(channels, length, sampleRate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    signal.throwIfAborted();
    const bytes = new ArrayBuffer(44 + rendered.length * channels * 2);
    const view = new DataView(bytes);
    const tag = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
    tag(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true); tag(8, 'WAVE'); tag(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true);
    tag(36, 'data'); view.setUint32(40, bytes.byteLength - 44, true);
    const samples = Array.from({ length: channels }, (_, index) => rendered.getChannelData(index));
    let offset = 44;
    for (let index = 0; index < rendered.length; index++) {
      if (index % 100000 === 0) signal.throwIfAborted();
      for (const channel of samples) {
        const sample = Math.max(-1, Math.min(1, channel[index]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([bytes], { type: 'audio/wav' });
  } catch (error) {
    signal.throwIfAborted();
    if (error?.name === 'EncodingError' || error?.name === 'NotSupportedError') throw new Error(t('audioDecodeError'));
    throw error;
  } finally { await context.close(); }
}
