// Small ZIP writer for already-compressed local outputs (JPEG/PNG pages).
import { t } from './i18n.js';

export const MAX_ZIP_BYTES = 200 * 1024 ** 2;
const table = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});

async function crc32(bytes, signal) {
  let value = 0xffffffff;
  for (let offset = 0; offset < bytes.length; offset += 65536) {
    signal.throwIfAborted();
    for (const byte of bytes.subarray(offset, offset + 65536)) value = table[(value ^ byte) & 255] ^ (value >>> 8);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return (value ^ 0xffffffff) >>> 0;
}

export async function zipBlobs(entries, signal) {
  if (entries.length > 200) throw new Error(t('tooManyPages'));
  const encoder = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  for (const { name, blob } of entries) {
    signal.throwIfAborted();
    const filename = encoder.encode(name);
    if (filename.length > 65535 || blob.size > MAX_ZIP_BYTES || offset + blob.size > MAX_ZIP_BYTES) throw new Error(t('zipTooLarge'));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const checksum = await crc32(bytes, signal);
    const header = new ArrayBuffer(30);
    const local = new DataView(header);
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // UTF-8 filenames
    local.setUint32(14, checksum, true);
    local.setUint32(18, bytes.length, true);
    local.setUint32(22, bytes.length, true);
    local.setUint16(26, filename.length, true);
    parts.push(header, filename, blob);

    const record = new ArrayBuffer(46);
    const directory = new DataView(record);
    directory.setUint32(0, 0x02014b50, true);
    directory.setUint16(4, 20, true);
    directory.setUint16(6, 20, true);
    directory.setUint16(8, 0x0800, true);
    directory.setUint32(16, checksum, true);
    directory.setUint32(20, bytes.length, true);
    directory.setUint32(24, bytes.length, true);
    directory.setUint16(28, filename.length, true);
    directory.setUint32(42, offset, true);
    central.push(record, filename);
    offset += header.byteLength + filename.length + bytes.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.byteLength, 0);
  const end = new ArrayBuffer(22);
  const footer = new DataView(end);
  footer.setUint32(0, 0x06054b50, true);
  footer.setUint16(8, entries.length, true);
  footer.setUint16(10, entries.length, true);
  footer.setUint32(12, centralSize, true);
  footer.setUint32(16, offset, true);
  signal.throwIfAborted();
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
