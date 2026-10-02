import { t } from './i18n.js';

const decoder = new TextDecoder();
const MAX_ENTRY_SIZE = 25 * 1024 ** 2;
const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// OOXML files are ZIP archives. Read their central directory rather than
// trusting the filename or scanning compressed bytes for document markers.
export async function officeEntries(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const u16 = (at) => view.getUint16(at, true);
  const u32 = (at) => view.getUint32(at, true);
  let end = -1;
  for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 65557); at--) {
    if (u32(at) === 0x06054b50) { end = at; break; }
  }
  if (end < 0 || u16(end + 4) || u16(end + 6) || u16(end + 8) !== u16(end + 10)) throw new Error(t('officeReadError'));
  const count = u16(end + 10);
  let offset = u32(end + 16);
  if (count > 10000 || offset + u32(end + 12) > bytes.length) throw new Error(t('officeReadError'));
  const entries = new Map();
  for (let index = 0; index < count; index++) {
    if (offset + 46 > bytes.length || u32(offset) !== 0x02014b50) throw new Error(t('officeReadError'));
    if (u16(offset + 8) & 1) throw new Error(t('officeReadError'));
    const method = u16(offset + 10);
    const checksum = u32(offset + 16);
    const compressedSize = u32(offset + 20);
    const size = u32(offset + 24);
    const nameLength = u16(offset + 28);
    const next = offset + 46 + nameLength + u16(offset + 30) + u16(offset + 32);
    if (next > bytes.length) throw new Error(t('officeReadError'));
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    entries.set(name, { method, compressedSize, size, checksum, offset: u32(offset + 42) });
    offset = next;
  }
  return {
    has: (name) => entries.has(name),
    names: () => [...entries.keys()],
    async read(name) {
      const entry = entries.get(name);
      if (!entry || entry.size > MAX_ENTRY_SIZE || ![0, 8].includes(entry.method)) throw new Error(t('officeReadError'));
      const at = entry.offset;
      if (at + 30 > bytes.length || u32(at) !== 0x04034b50) throw new Error(t('officeReadError'));
      const start = at + 30 + u16(at + 26) + u16(at + 28);
      const data = bytes.subarray(start, start + entry.compressedSize);
      if (data.length !== entry.compressedSize) throw new Error(t('officeReadError'));
      let output = data;
      if (entry.method === 8) {
        let inflater;
        try { inflater = new DecompressionStream('deflate-raw'); }
        catch { throw new Error(t('officeReadError')); }
        const reader = new Blob([data]).stream().pipeThrough(inflater).getReader();
        const chunks = [];
        let length = 0;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.length;
            if (length > MAX_ENTRY_SIZE) { await reader.cancel(); throw new Error(t('officeReadError')); }
            chunks.push(value);
          }
        } finally { reader.releaseLock(); }
        output = new Uint8Array(length);
        let position = 0;
        for (const chunk of chunks) { output.set(chunk, position); position += chunk.length; }
      }
      if (output.length !== entry.size || output.length > MAX_ENTRY_SIZE || crc32(output) !== entry.checksum) throw new Error(t('officeReadError'));
      return decoder.decode(output);
    },
  };
}

function xml(text) {
  if (/<!DOCTYPE/i.test(text)) throw new Error(t('officeReadError'));
  const document = new DOMParser().parseFromString(text, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error(t('officeReadError'));
  return document;
}

const elements = (parent, name) => [...parent.getElementsByTagNameNS('*', name)];

export async function docxToText(file, signal) {
  signal.throwIfAborted();
  const zip = await officeEntries(file);
  const document = xml(await zip.read('word/document.xml'));
  signal.throwIfAborted();
  const paragraphs = elements(document, 'p').map((paragraph) => {
    const chunks = [];
    for (const node of paragraph.getElementsByTagName('*')) {
      if (node.localName === 't') chunks.push(node.textContent);
      else if (node.localName === 'tab') chunks.push('\t');
      else if (node.localName === 'br') chunks.push('\n');
    }
    return chunks.join('');
  });
  return new Blob([paragraphs.join('\n') + '\n'], { type: 'text/plain' });
}

export async function xlsxToCsv(file, signal) {
  signal.throwIfAborted();
  const zip = await officeEntries(file);
  const sheets = zip.names().filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));
  if (!sheets.length) throw new Error(t('officeReadError'));
  const shared = zip.has('xl/sharedStrings.xml') ? elements(xml(await zip.read('xl/sharedStrings.xml')), 'si').map((item) => elements(item, 't').map((part) => part.textContent).join('')) : [];
  const sheet = xml(await zip.read(sheets[0]));
  signal.throwIfAborted();
  const escape = (value) => /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
  const rows = [];
  for (const row of elements(sheet, 'row')) {
    const values = [];
    for (const cell of elements(row, 'c')) {
      const ref = cell.getAttribute('r')?.match(/^[A-Z]+/i)?.[0]?.toUpperCase();
      if (!ref) continue;
      let column = 0;
      for (const letter of ref) column = column * 26 + letter.charCodeAt(0) - 64;
      if (column > 16384) throw new Error(t('officeReadError'));
      const type = cell.getAttribute('t');
      const raw = elements(cell, type === 'inlineStr' ? 't' : 'v').map((value) => value.textContent).join('');
      values[column - 1] = type === 's' ? shared[Number(raw)] ?? '' : type === 'b' ? (raw === '1' ? 'TRUE' : 'FALSE') : raw;
    }
    rows.push(Array.from({ length: values.length }, (_, index) => escape(values[index] ?? '')).join(','));
  }
  signal.throwIfAborted();
  return new Blob(['\ufeff', rows.join('\r\n'), '\r\n'], { type: 'text/csv' });
}
